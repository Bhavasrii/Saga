import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getMe,
  updateMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post(
  '/register',
  validate([
    body('name').trim().notEmpty().withMessage('Please enter your full name'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please enter a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ]),
  register
);

router.post(
  '/login',
  validate([
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please enter a valid email address'),
    body('password').notEmpty().withMessage('Please enter your password'),
  ]),
  login
);

router.get('/me', protect, getMe);
router.put(
  '/me',
  protect,
  validate([
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
  ]),
  updateMe
);

export default router;
