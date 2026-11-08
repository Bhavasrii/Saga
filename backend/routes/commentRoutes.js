import express from 'express';
import { body } from 'express-validator';
import {
  getCommentsByPost,
  getAllComments,
  createComment,
  updateCommentStatus,
  deleteComment,
} from '../controllers/commentController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/post/:postId', optionalProtect, getCommentsByPost);

router.get('/', protect, authorize('editor', 'admin'), getAllComments);

router.post(
  '/',
  protect,
  validate([
    body('postId').notEmpty().withMessage('Story reference is required'),
    body('text')
      .trim()
      .notEmpty()
      .withMessage('Comment cannot be empty')
      .isLength({ max: 1000 })
      .withMessage('Comment cannot exceed 1000 characters'),
  ]),
  createComment
);

router.put(
  '/:id/status',
  protect,
  authorize('editor', 'admin'),
  validate([
    body('status')
      .isIn(['pending', 'approved', 'rejected'])
      .withMessage('Valid status is required'),
  ]),
  updateCommentStatus
);

router.delete('/:id', protect, deleteComment);

export default router;
