import Media from '../models/Media.js';

const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// @desc    Get media library items
// @route   GET /api/media
// @access  Private (author, editor, admin)
export const getMedia = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 24));
    const search = req.query.search?.trim();

    const filter = {};
    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ title: searchRegex }, { altText: searchRegex }];
    }

    const skip = (page - 1) * limit;
    const total = await Media.countDocuments(filter);

    const media = await Media.find(filter)
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pages = Math.ceil(total / limit) || 1;

    res.json({
      success: true,
      media,
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

// @desc    Add image URL to media library
// @route   POST /api/media
// @access  Private (author, editor, admin)
export const createMedia = async (req, res, next) => {
  try {
    const { title, url, altText } = req.body;

    const mediaItem = await Media.create({
      title: title.trim(),
      url: url.trim(),
      altText: altText ? altText.trim() : '',
      uploadedBy: req.user._id,
    });

    const populated = await Media.findById(mediaItem._id).populate(
      'uploadedBy',
      'name email role'
    );

    res.status(201).json({
      success: true,
      media: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete media item
// @route   DELETE /api/media/:id
// @access  Private (uploader, editor, admin)
export const deleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const item = await Media.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Media item not found.',
      });
    }

    const isUploader = user._id.toString() === item.uploadedBy.toString();
    const isStaff = ['editor', 'admin'].includes(user.role);

    if (!isUploader && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete images you added.',
      });
    }

    await Media.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Image removed from library.',
    });
  } catch (error) {
    next(error);
  }
};
