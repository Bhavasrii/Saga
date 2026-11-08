import express from 'express';
import { body } from 'express-validator';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

router.post(
  '/',
  protect,
  authorize('editor', 'admin'),
  validate([
    body('name').trim().notEmpty().withMessage('Please provide a topic name'),
  ]),
  createCategory
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
      .withMessage('Topic name cannot be empty'),
  ]),
  updateCategory
);

router.delete(
  '/:id',
  protect,
  authorize('editor', 'admin'),
  deleteCategory
);

export default router;
