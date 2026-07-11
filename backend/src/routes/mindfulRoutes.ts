import express from 'express';
import { getTracksByLanguage } from '../controllers/mindfulController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getTracksByLanguage);

export default router;
