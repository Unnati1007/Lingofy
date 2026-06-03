import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import { getComparisonAnalytics } from '../controllers/analytics/analyticsController';

const router = express.Router();

router.get('/comparison', protect, admin, getComparisonAnalytics);

export default router;
