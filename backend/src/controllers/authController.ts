import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user/User";

const generateToken = (id: string, email: string) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "30d",
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    
    // Default name if not provided but email exists (since design doesn't ask for name but model expects it)
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

    // Email or Username Support
    // The design says "Email or Username", we'll check name and email
    let user;
    if (email.includes("@")) {
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({ name: email });
      if (!user) user = await User.findOne({ email }); // Fallback
    }

    if (user && (await user.comparePassword(password))) {
      const token = generateToken(user._id.toString(), user.email);
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
