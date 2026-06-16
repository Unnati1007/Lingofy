import express from "express";
import { register, login, forgotPassword, verifyResetCode, resetPassword } from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-code", verifyResetCode);
router.post("/reset-password", resetPassword);

export default router;
