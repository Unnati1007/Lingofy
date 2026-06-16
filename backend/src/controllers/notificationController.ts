import { Request, Response } from "express";
import Notification from "../models/user/Notification";
import User from "../models/user/User";
import nodemailer from "nodemailer";

export const getNotifications = async (req: any, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }
    res.json(notification);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req: any, res: Response): Promise<void> => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const sendNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, title, message, sendEmail } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // 1. Create In-App Notification
    const notification = await Notification.create({
      userId,
      title,
      message,
    });

    // 2. Send Email if requested
    if (sendEmail) {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        res.status(500).json({ message: "Email configuration is missing on the server. In-app notification sent successfully." });
        return;
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #a855f7;">${title}</h2>
            <p style="font-size: 16px; color: #333; line-height: 1.5;">Hello ${user.name},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.5;">${message}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #999;">This is an automated message from Lingofy Admin.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    res.status(201).json({ message: "Notification sent successfully", notification });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
