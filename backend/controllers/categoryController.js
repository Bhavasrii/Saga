import Category from '../models/Category.js';
import Post from '../models/Post.js';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// @desc    Get all topics with story counts
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    // Count published stories per topic
    const counts = await Post.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const categoriesWithCount = categories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      storyCount: countMap[cat._id.toString()] || 0,
      createdAt: cat.createdAt,
    }));

    res.json({
      success: true,
      categories: categoriesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get topic by slug
// @route   GET /api/categories/:slug
// @access  Public
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found.',
      });
    }

    const storyCount = await Post.countDocuments({
      category: category._id,
      status: 'published',
    });

    res.json({
      success: true,
      category: {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        storyCount,
        createdAt: category.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new topic
// @route   POST /api/categories
// @access  Private (editor, admin)
export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const slug = slugify(name);

    const existing = await Category.findOne({
      $or: [{ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } }, { slug }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A topic with this name already exists.',
      });
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description ? description.trim() : '',
    });

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a topic
// @route   PUT /api/categories/:id
// @access  Private (editor, admin)
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found.',
      });
    }

    if (name && name.trim() !== category.name) {
      const newSlug = slugify(name);
      const duplicate = await Category.findOne({
        _id: { $ne: id },
        $or: [{ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } }, { slug: newSlug }],
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Another topic already uses this name.',
        });
      }

      category.name = name.trim();
      category.slug = newSlug;
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    await category.save();

    res.json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a topic
// @route   DELETE /api/categories/:id
// @access  Private (editor, admin)
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found.',
      });
    }

    // Check if stories are using this category
    const storiesCount = await Post.countDocuments({ category: id });
    if (storiesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete topic because ${storiesCount} stories are currently filed under it.`,
      });
    }

    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Topic deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
