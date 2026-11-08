import express from 'express';
import { body } from 'express-validator';
import {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', optionalProtect, getPosts);
router.get('/:slug', optionalProtect, getPostBySlug);

router.post(
  '/',
  protect,
  authorize('author', 'editor', 'admin'),
  validate([
    body('title').trim().notEmpty().withMessage('Please provide a title for your story'),
    body('content').notEmpty().withMessage('Story content cannot be empty'),
    body('category').notEmpty().withMessage('Please select a topic for your story'),
  ]),
  createPost
);

router.put(
  '/:id',
  protect,
  authorize('author', 'editor', 'admin'),
  validate([
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty'),
    body('content')
      .optional()
      .notEmpty()
      .withMessage('Story content cannot be empty'),
    body('category')
      .optional()
      .notEmpty()
      .withMessage('Topic cannot be empty'),
  ]),
  updatePost
);

router.delete(
  '/:id',
  protect,
  authorize('author', 'editor', 'admin'),
  deletePost
);

export default router;
