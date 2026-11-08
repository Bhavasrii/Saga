import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    excerpt: {
      type: String,
      trim: true,
      default: '',
      maxlength: [400, 'Excerpt cannot exceed 400 characters'],
    },
    coverImage: {
      type: String,
      default: '',
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Topic is required'],
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'pending', 'scheduled', 'published'],
      default: 'draft',
    },
    publishAt: {
      type: Date,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ status: 1 });
postSchema.index({ category: 1 });
postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ views: -1 });

// Auto-generate excerpt if empty
postSchema.pre('save', function (next) {
  if (!this.excerpt && this.content) {
    const plainText = this.content.replace(/<[^>]+>/g, '').replace(/[#*`_~]/g, '');
    this.excerpt = plainText.slice(0, 160).trim() + (plainText.length > 160 ? '...' : '');
  }

  // Ensure publishAt is set when published
  if (this.status === 'published' && !this.publishAt) {
    this.publishAt = new Date();
  }

  next();
});

const Post = mongoose.model('Post', postSchema);
export default Post;
