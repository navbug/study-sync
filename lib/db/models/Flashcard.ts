import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFlashcard extends Document {
  userId: mongoose.Types.ObjectId;
  materialId?: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isAIGenerated: boolean;
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardSchema = new Schema<IFlashcard>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    materialId: {
      type: Schema.Types.ObjectId,
      ref: 'Material',
    },
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
      minlength: [5, 'Question must be at least 5 characters'],
      maxlength: [500, 'Question cannot exceed 500 characters'],
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
      minlength: [1, 'Answer must be at least 1 character'],
      maxlength: [1000, 'Answer cannot exceed 1000 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    lastReviewed: {
      type: Date,
    },
    nextReview: {
      type: Date,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
FlashcardSchema.index({ userId: 1, createdAt: -1 });
FlashcardSchema.index({ subject: 1 });
FlashcardSchema.index({ nextReview: 1 });

const Flashcard: Model<IFlashcard> = 
  mongoose.models.Flashcard || mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);

export default Flashcard;