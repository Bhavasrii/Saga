import cron from 'node-cron';
import Post from '../models/Post.js';

export const initScheduler = () => {
  // Check every minute for stories scheduled for publication
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const result = await Post.updateMany(
        {
          status: 'scheduled',
          publishAt: { $lte: now },
        },
        {
          $set: { status: 'published' },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`[Scheduler] Automatically published ${result.modifiedCount} scheduled story/stories.`);
      }
    } catch (error) {
      console.error('[Scheduler] Error checking scheduled stories:', error.message);
    }
  });

  console.log('[Scheduler] Publishing scheduler initialized (every 1 minute)');
};

export default initScheduler;
