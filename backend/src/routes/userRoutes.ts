import express from "express";
import { protect, admin } from "../middleware/authMiddleware";
import { getAllUsers, changeUserMode, changeMyMode, getMe, updateProfile } from "../controllers/user/userController";

const router = express.Router();

// User routes (must be before /:id routes to prevent overriding)
router.get("/me", protect, getMe);
router.put("/me/mode", protect, changeMyMode);
router.put("/me/profile", protect, updateProfile);

// Admin routes
router.get("/", protect, admin, getAllUsers);
router.put("/:id/mode", protect, admin, changeUserMode);

export default router;
