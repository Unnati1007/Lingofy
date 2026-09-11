import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
  getNotes,
  getNoteStats,
  createNote,
  updateNote,
  deleteNote
} from "../controllers/noteController";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getNotes)
  .post(createNote);

router.get("/stats", getNoteStats);

router.route("/:id")
  .put(updateNote)
  .delete(deleteNote);

export default router;
