import { Request, Response } from "express";
import User from "../../models/user/User";

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const changeUserMode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { mode } = req.body;
    
    if (!['music', 'traditional'].includes(mode)) {
      res.status(400).json({ message: "Invalid mode" });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.learningMode = mode;
    await user.save();

    res.json({ message: "User mode updated successfully", user: {
      _id: user.id,
      name: user.name,
      learningMode: user.learningMode
    }});
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const changeMyMode = async (req: any, res: Response): Promise<void> => {
  try {
    const { mode } = req.body;
    
    if (!['music', 'traditional'].includes(mode)) {
      res.status(400).json({ message: "Invalid mode" });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.learningMode = mode;
    await user.save();

    res.json({ message: "Mode updated successfully", mode: user.learningMode });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
