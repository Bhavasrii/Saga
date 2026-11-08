import Tag from '../models/Tag.js';
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

// @desc    Get all tags with story counts
// @route   GET /api/tags
// @access  Public
export const getTags = async (req, res, next) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });

    const counts = await Post.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const tagsWithCount = tags.map((t) => ({
      _id: t._id,
      name: t.name,
      slug: t.slug,
      storyCount: countMap[t._id.toString()] || 0,
    }));

    res.json({
      success: true,
      tags: tagsWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a tag
// @route   POST /api/tags
// @access  Private (editor, admin)
export const createTag = async (req, res, next) => {
  try {
    const { name } = req.body;
    const slug = slugify(name);

    const existing = await Tag.findOne({
      $or: [{ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } }, { slug }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A tag with this name already exists.',
      });
    }

    const tag = await Tag.create({
      name: name.trim(),
      slug,
    });

    res.status(201).json({
      success: true,
      tag,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a tag
// @route   PUT /api/tags/:id
// @access  Private (editor, admin)
export const updateTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found.',
      });
    }

    if (name && name.trim() !== tag.name) {
      const newSlug = slugify(name);
      const duplicate = await Tag.findOne({
        _id: { $ne: id },
        $or: [{ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } }, { slug: newSlug }],
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Another tag already uses this name.',
        });
      }

      tag.name = name.trim();
      tag.slug = newSlug;
    }

    await tag.save();

    res.json({
      success: true,
      tag,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a tag
// @route   DELETE /api/tags/:id
// @access  Private (editor, admin)
export const deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found.',
      });
    }

    // Pull tag from posts
    await Post.updateMany({ tags: id }, { $pull: { tags: id } });
    await Tag.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Tag deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
