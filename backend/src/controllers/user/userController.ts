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

export const updateProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { name, nativeLanguage, learningLanguage, age, dailyGoal, proficiency, about, mobile, profession, knownLanguages, username } = req.body;

    if (name !== undefined) user.name = name;
    if (nativeLanguage !== undefined) user.nativeLanguage = nativeLanguage;
    if (learningLanguage !== undefined) user.learningLanguage = learningLanguage;
    if (age !== undefined) user.age = Number(age);
    if (dailyGoal !== undefined) user.dailyGoal = Number(dailyGoal);
    if (proficiency !== undefined) user.proficiency = proficiency;
    if (about !== undefined) user.about = about;
    if (mobile !== undefined) user.mobile = mobile;
    if (profession !== undefined) user.profession = profession;
    if (knownLanguages !== undefined) user.knownLanguages = knownLanguages;
    if (username !== undefined) user.username = username;

    await user.save();

    res.json({ message: "Profile updated successfully", user: {
      _id: user.id,
      name: user.name,
      email: user.email,
      nativeLanguage: user.nativeLanguage,
      learningLanguage: user.learningLanguage,
      age: user.age,
      dailyGoal: user.dailyGoal,
      proficiency: user.proficiency,
      learningMode: user.learningMode,
      about: user.about,
      mobile: user.mobile,
      profession: user.profession,
      knownLanguages: user.knownLanguages,
      username: user.username
    }});
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
