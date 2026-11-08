import User from '../models/User.js';

const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// @desc    Get all members with search, role filter, pagination
// @route   GET /api/users
// @access  Private (admin only)
export const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const search = req.query.search?.trim();
    const role = req.query.role?.trim();
    const sort = req.query.sort?.trim() || 'newest';

    const filter = {};
    if (role && ['admin', 'editor', 'author', 'reader'].includes(role)) {
      filter.role = role;
    }

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'name') {
      sortOptions = { name: 1 };
    }

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select('-password')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const pages = Math.ceil(total / limit) || 1;

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page,
        pages,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a member's role
// @route   PUT /api/users/:id/role
// @access  Private (admin only)
export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'editor', 'author', 'reader'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified.',
      });
    }

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Member not found.',
      });
    }

    // Safety: ensure at least one admin remains
    if (userToUpdate.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot demote the sole administrator of the platform.',
        });
      }
    }

    userToUpdate.role = role;
    await userToUpdate.save();

    res.json({
      success: true,
      user: userToUpdate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a member account
// @route   DELETE /api/users/:id
// @access  Private (admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.',
      });
    }

    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Member not found.',
      });
    }

    if (userToDelete.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the sole administrator.',
        });
      }
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Member account removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
