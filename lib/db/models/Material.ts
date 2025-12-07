import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMaterial extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  content: string;
  tags: string[];
  aiSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema = new Schema<IMaterial>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [50, 'Subject cannot exceed 50 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [10, 'Content must be at least 10 characters'],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function(tags: string[]) {
          return tags.length <= 10;
        },
        message: 'Cannot have more than 10 tags',
      },
    },
    aiSummary: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
MaterialSchema.index({ userId: 1, createdAt: -1 });
MaterialSchema.index({ subject: 1 });
MaterialSchema.index({ tags: 1 });

const Material: Model<IMaterial> = 
  mongoose.models.Material || mongoose.model<IMaterial>('Material', MaterialSchema);

export default Material;