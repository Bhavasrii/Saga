import Post from '../models/Post.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import Category from '../models/Category.js';

// @desc    Get summary report for Insights dashboard
// @route   GET /api/reports/summary
// @access  Private (editor, admin)
export const getSummary = async (req, res, next) => {
  try {
    // 1. Stories by status
    const statusCounts = await Post.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const storiesByStatus = {
      draft: 0,
      pending: 0,
      scheduled: 0,
      published: 0,
    };
    statusCounts.forEach((item) => {
      if (item._id && storiesByStatus[item._id] !== undefined) {
        storiesByStatus[item._id] = item.count;
      }
    });

    // 2. Members by role
    const roleCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const membersByRole = {
      admin: 0,
      editor: 0,
      author: 0,
      reader: 0,
    };
    roleCounts.forEach((item) => {
      if (item._id && membersByRole[item._id] !== undefined) {
        membersByRole[item._id] = item.count;
      }
    });

    // 3. Comments waiting for review
    const pendingComments = await Comment.countDocuments({ status: 'pending' });
    const approvedComments = await Comment.countDocuments({ status: 'approved' });
    const totalComments = await Comment.countDocuments();

    // 4. Top 5 most-read stories
    const topStories = await Post.find({ status: 'published' })
      .select('title slug views author category publishAt')
      .populate('author', 'name')
      .populate('category', 'name slug')
      .sort({ views: -1 })
      .limit(5);

    // 5. Stories per topic
    const topicAggregation = await Post.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          publishedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      {
        $unwind: {
          path: '$categoryInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ['$categoryInfo.name', 'Uncategorized'] },
          count: 1,
          publishedCount: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // 6. Overall totals
    const viewsAggregation = await Post.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
        },
      },
    ]);
    const totalViews = viewsAggregation[0]?.totalViews || 0;
    const totalStories = await Post.countDocuments();
    const totalMembers = await User.countDocuments();

    res.json({
      success: true,
      reports: {
        totals: {
          stories: totalStories,
          publishedStories: storiesByStatus.published,
          views: totalViews,
          members: totalMembers,
          pendingComments,
          approvedComments,
          totalComments,
        },
        storiesByStatus,
        membersByRole,
        pendingComments,
        topStories,
        storiesPerTopic: topicAggregation,
      },
    });
  } catch (error) {
    next(error);
  }
};
