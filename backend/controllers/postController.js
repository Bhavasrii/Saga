import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Category from '../models/Category.js';
import Tag from '../models/Tag.js';
import Comment from '../models/Comment.js';

// Helper to escape regex special characters
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Helper to slugify titles
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Generate unique slug
const generateUniqueSlug = async (title, currentId = null) => {
  let baseSlug = slugify(title) || 'story';
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (currentId) {
      query._id = { $ne: currentId };
    }
    const existing = await Post.findOne(query);
    if (!existing) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

// @desc    Get all stories with filters, search, sort, pagination
// @route   GET /api/posts
// @access  Public / Role-aware
export const getPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const search = req.query.search?.trim();
    const categoryParam = req.query.category?.trim();
    const tagParam = req.query.tag?.trim();
    const statusParam = req.query.status?.trim();
    const sortParam = req.query.sort?.trim() || 'newest';
    const authorParam = req.query.author?.trim();
    const mine = req.query.mine === 'true' || req.query.mine === true;

    const user = req.user;
    const filter = {};

    // 1. Role-based visibility and status filter
    if (user && (user.role === 'admin' || user.role === 'editor')) {
      // Editors & Admins can see all statuses
      if (statusParam && ['draft', 'pending', 'scheduled', 'published'].includes(statusParam)) {
        filter.status = statusParam;
      }
      if (mine) {
        filter.author = user._id;
      } else if (authorParam && mongoose.Types.ObjectId.isValid(authorParam)) {
        filter.author = authorParam;
      }
    } else if (user && user.role === 'author') {
      if (mine) {
        // Author viewing their own stories: sees ALL statuses
        filter.author = user._id;
        if (statusParam && ['draft', 'pending', 'scheduled', 'published'].includes(statusParam)) {
          filter.status = statusParam;
        }
      } else {
        // Author browsing public stories: sees ONLY published stories
        filter.status = 'published';
        if (authorParam && mongoose.Types.ObjectId.isValid(authorParam)) {
          filter.author = authorParam;
        }
      }
    } else {
      // Guest or Reader: sees ONLY published stories
      filter.status = 'published';
      if (authorParam && mongoose.Types.ObjectId.isValid(authorParam)) {
        filter.author = authorParam;
      }
    }

    // 2. Category filter (by slug or ObjectId)
    if (categoryParam) {
      if (mongoose.Types.ObjectId.isValid(categoryParam)) {
        filter.category = categoryParam;
      } else {
        const foundCategory = await Category.findOne({ slug: categoryParam.toLowerCase() });
        if (foundCategory) {
          filter.category = foundCategory._id;
        } else {
          // If category slug does not exist, return empty result
          return res.json({
            success: true,
            posts: [],
            pagination: { total: 0, page, pages: 1, limit },
          });
        }
      }
    }

    // 3. Tag filter (by slug or ObjectId)
    if (tagParam) {
      if (mongoose.Types.ObjectId.isValid(tagParam)) {
        filter.tags = tagParam;
      } else {
        const foundTag = await Tag.findOne({ slug: tagParam.toLowerCase() });
        if (foundTag) {
          filter.tags = foundTag._id;
        } else {
          return res.json({
            success: true,
            posts: [],
            pagination: { total: 0, page, pages: 1, limit },
          });
        }
      }
    }

    // 4. Safe text search
    if (search) {
      const escaped = escapeRegex(search);
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { content: searchRegex },
      ];
    }

    // 5. Sorting
    let sortOptions = { publishAt: -1, createdAt: -1 };
    if (sortParam === 'most-read') {
      sortOptions = { views: -1, createdAt: -1 };
    } else if (sortParam === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sortParam === 'title') {
      sortOptions = { title: 1 };
    }

    const skip = (page - 1) * limit;
    const total = await Post.countDocuments(filter);

    const posts = await Post.find(filter)
      .populate('author', 'name email role')
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const pages = Math.ceil(total / limit) || 1;

    res.json({
      success: true,
      posts,
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

// @desc    Get single story by slug
// @route   GET /api/posts/:slug
// @access  Public / Role-aware
export const getPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({ slug })
      .populate('author', 'name email role')
      .populate('category', 'name slug description')
      .populate('tags', 'name slug');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Story not found.',
      });
    }

    // Check visibility permissions
    if (post.status !== 'published') {
      const user = req.user;
      const isAuthor = user && user._id.toString() === post.author._id.toString();
      const isStaff = user && (user.role === 'admin' || user.role === 'editor');

      if (!isAuthor && !isStaff) {
        return res.status(404).json({
          success: false,
          message: 'Story not found.',
        });
      }
    }

    // Increment views for published stories
    if (post.status === 'published') {
      post.views += 1;
      await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } });
    }

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new story
// @route   POST /api/posts
// @access  Private (author, editor, admin)
export const createPost = async (req, res, next) => {
  try {
    const { title, content, excerpt, coverImage, category, tags, status, publishAt } = req.body;
    const user = req.user;

    const slug = await generateUniqueSlug(title);

    let finalStatus = 'draft';
    let finalPublishAt = null;

    if (user.role === 'author') {
      // Authors can only create drafts or submit for review (pending)
      finalStatus = status === 'pending' ? 'pending' : 'draft';
    } else if (['editor', 'admin'].includes(user.role)) {
      // Editors and admins can publish or schedule directly
      if (['draft', 'pending', 'scheduled', 'published'].includes(status)) {
        finalStatus = status;
      }
      if (finalStatus === 'scheduled') {
        finalPublishAt = publishAt ? new Date(publishAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      } else if (finalStatus === 'published') {
        finalPublishAt = new Date();
      }
    }

    const post = await Post.create({
      title,
      slug,
      content,
      excerpt,
      coverImage: coverImage || '',
      category,
      tags: tags || [],
      author: user._id,
      status: finalStatus,
      publishAt: finalPublishAt,
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email role')
      .populate('category', 'name slug')
      .populate('tags', 'name slug');

    res.status(201).json({
      success: true,
      post: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a story
// @route   PUT /api/posts/:id
// @access  Private (author of post, editor, admin)
export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, coverImage, category, tags, status, publishAt } = req.body;
    const user = req.user;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Story not found.',
      });
    }

    const isAuthor = user._id.toString() === post.author.toString();
    const isStaff = ['editor', 'admin'].includes(user.role);

    if (!isAuthor && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own stories.',
      });
    }

    if (title && title.trim() !== post.title) {
      post.title = title.trim();
      post.slug = await generateUniqueSlug(post.title, post._id);
    }

    if (content !== undefined) post.content = content;
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (category) post.category = category;
    if (tags !== undefined) post.tags = tags;

    // Status permissions
    if (isStaff) {
      if (status && ['draft', 'pending', 'scheduled', 'published'].includes(status)) {
        post.status = status;
        if (status === 'scheduled') {
          post.publishAt = publishAt ? new Date(publishAt) : post.publishAt || new Date(Date.now() + 24 * 60 * 60 * 1000);
        } else if (status === 'published' && !post.publishAt) {
          post.publishAt = new Date();
        }
      }
    } else if (isAuthor) {
      if (status === 'pending') {
        post.status = 'pending';
      } else if (status === 'draft') {
        post.status = 'draft';
      }
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name email role')
      .populate('category', 'name slug')
      .populate('tags', 'name slug');

    res.json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a story
// @route   DELETE /api/posts/:id
// @access  Private (author of post, editor, admin)
export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Story not found.',
      });
    }

    const isAuthor = user._id.toString() === post.author.toString();
    const isStaff = ['editor', 'admin'].includes(user.role);

    if (!isAuthor && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own stories.',
      });
    }

    await Post.findByIdAndDelete(id);
    await Comment.deleteMany({ post: id });

    res.json({
      success: true,
      message: 'Story deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
