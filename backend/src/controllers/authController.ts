import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import nodemailer from "nodemailer";
import User from "../models/user/User";
import UserPreferences from "../models/user/UserPreference";

const generateToken = (id: string, email: string) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "30d",
  });
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      res.status(400).json({ message: "Invalid Google token" });
      return;
    }

    const { email, name, sub: googleId } = payload;
    
    if (!email) {
      res.status(400).json({ message: "Email not provided by Google" });
      return;
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create user with random secure password
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + "Aa1!";
      
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        password: randomPassword,
        googleId,
        role: "user"
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = generateToken(user._id.toString(), user.email);
    const preferences = await UserPreferences.findOne({ userId: user._id });

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      learningMode: user.learningMode,
      hasPreferences: !!preferences,
      token,
    });
  } catch (error: any) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    
    const userName = name || email.split("@")[0];
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const user = await User.create({
      name: userName,
      email,
      password,
      role: "user"
    });

    if (user) {
      const token = generateToken(user._id.toString(), user.email);
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        learningMode: user.learningMode,
        hasPreferences: false,
        token,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const trimmedEmail = email?.trim();
    const trimmedPassword = password?.trim();

    let user;
    if (trimmedEmail.includes("@")) {
      user = await User.findOne({ email: trimmedEmail });
    } else {
      user = await User.findOne({ name: trimmedEmail });
      if (!user) user = await User.findOne({ email: trimmedEmail });
    }

    if (user && (await user.comparePassword(trimmedPassword))) {
      const token = generateToken(user._id.toString(), user.email);
      
      // Check if preferences exist
      const preferences = await UserPreferences.findOne({ userId: user._id });

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        learningMode: user.learningMode,
        hasPreferences: !!preferences,
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    
    if (!user) {
      res.status(404).json({ message: "User with this email does not exist" });
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.resetPasswordCode = code;
    user.resetPasswordExpires = expires;
    await user.save();

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Lingofy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Lingofy - Your Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
          <h2 style="color: #12793d;">Lingofy Password Reset</h2>
          <p>We received a request to reset the password for your Lingofy account.</p>
          <p>Here is your 6-digit verification code:</p>
          <div style="margin: 30px auto; padding: 20px; background-color: #f4f4f4; border-radius: 8px; max-width: 200px; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333;">
            ${code}
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`[EMAIL SENT] Password reset code sent to ${email}`);
    } catch (mailError) {
      console.warn(`[EMAIL WARNING] Could not send email via SMTP, simulating email. The code is: ${code}`);
    }

    res.json({ message: "Reset code sent to your email (or simulated in console)" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyResetCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired reset code" });
      return;
    }

    res.json({ message: "Code verified successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired reset code" });
      return;
    }

    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
