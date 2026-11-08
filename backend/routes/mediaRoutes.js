import express from 'express';
import { body } from 'express-validator';
import {
  getMedia,
  createMedia,
  deleteMedia,
} from '../controllers/mediaController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', protect, authorize('author', 'editor', 'admin'), getMedia);

router.post(
  '/',
  protect,
  authorize('author', 'editor', 'admin'),
  validate([
    body('title').trim().notEmpty().withMessage('Please provide an image title'),
    body('url')
      .trim()
      .notEmpty()
      .withMessage('Please provide an image URL')
      .isURL()
      .withMessage('Please provide a valid URL'),
  ]),
  createMedia
);

router.delete('/:id', protect, authorize('author', 'editor', 'admin'), deleteMedia);

export default router;
