import express from 'express';
import { body } from 'express-validator';
import {
  getUsers,
  updateUserRole,
  deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getUsers);

router.put(
  '/:id/role',
  protect,
  authorize('admin'),
  validate([
    body('role')
      .isIn(['admin', 'editor', 'author', 'reader'])
      .withMessage('Role must be admin, editor, author, or reader'),
  ]),
  updateUserRole
);

router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;
