import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

// Helper to escape regex
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// @desc    Get approved comments for a specific story
// @route   GET /api/comments/post/:postId
// @access  Public / Role-aware
export const getCommentsByPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const user = req.user;

    const filter = { post: postId };

    // Visitors & regular readers see only approved comments
    // Authors of the post and editors/admins can also view pending comments for that story
    const post = await Post.findById(postId);
    const isPostAuthor = user && post && user._id.toString() === post.author.toString();
    const isStaff = user && ['editor', 'admin'].includes(user.role);

    if (!isPostAuthor && !isStaff) {
      filter.status = 'approved';
    } else if (req.query.status) {
      filter.status = req.query.status;
    }

    const comments = await Comment.find(filter)
      .populate('user', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all comments (Editorial queue)
// @route   GET /api/comments
// @access  Private (editor, admin)
export const getAllComments = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const status = req.query.status?.trim();
    const search = req.query.search?.trim();

    const filter = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), 'i');
      filter.text = searchRegex;
    }

    const skip = (page - 1) * limit;
    const total = await Comment.countDocuments(filter);

    const comments = await Comment.find(filter)
      .populate('user', 'name email role')
      .populate('post', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pages = Math.ceil(total / limit) || 1;

    res.json({
      success: true,
      comments,
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

// @desc    Add a comment to a story
// @route   POST /api/comments
// @access  Private (reader, author, editor, admin)
export const createComment = async (req, res, next) => {
  try {
    const { postId, text } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Story not found.',
      });
    }

    // All comments start as pending for review
    const comment = await Comment.create({
      post: postId,
      user: req.user._id,
      text: text.trim(),
      status: 'pending',
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'user',
      'name role'
    );

    res.status(201).json({
      success: true,
      comment: populatedComment,
      message: 'Your comment has been submitted and is awaiting review.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Review a comment (approve or reject)
// @route   PUT /api/comments/:id/status
// @access  Private (editor, admin)
export const updateCommentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be pending, approved, or rejected.',
      });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    comment.status = status;
    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name email role')
      .populate('post', 'title slug');

    res.json({
      success: true,
      comment: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (editor, admin, or comment author)
export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    const isAuthor = user._id.toString() === comment.user.toString();
    const isStaff = ['editor', 'admin'].includes(user.role);

    if (!isAuthor && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'You can only remove your own comments.',
      });
    }

    await Comment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Comment removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
