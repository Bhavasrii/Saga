import express from 'express';
import { getSummary } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/summary', protect, authorize('editor', 'admin'), getSummary);

export default router;
