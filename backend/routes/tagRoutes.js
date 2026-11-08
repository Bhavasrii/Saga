import express from 'express';
import { body } from 'express-validator';
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
} from '../controllers/tagController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getTags);

router.post(
  '/',
  protect,
  authorize('editor', 'admin'),
  validate([
    body('name').trim().notEmpty().withMessage('Please provide a tag name'),
  ]),
  createTag
);

router.put(
  '/:id',
  protect,
  authorize('editor', 'admin'),
  validate([
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Tag name cannot be empty'),
  ]),
  updateTag
);

router.delete('/:id', protect, authorize('editor', 'admin'), deleteTag);

export default router;
