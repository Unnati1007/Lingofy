import express from "express";
import { protect, admin } from "../middleware/authMiddleware";
import { getNotifications, markAsRead, markAllAsRead, sendNotification } from "../controllers/notificationController";

const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/read-all", protect, markAllAsRead);
router.put("/:id/read", protect, markAsRead);

// Admin route
router.post("/admin/send", protect, admin, sendNotification);

export default router;
