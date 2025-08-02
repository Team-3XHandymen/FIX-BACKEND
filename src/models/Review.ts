import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewDocument extends Document {
  bookingId: string;
  from: string; // Client ID
  to: string; // Service Provider ID
  rating: number; // 1-5 stars
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReviewDocument>({
  bookingId: {
    type: String,
    required: true,
    unique: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for better query performance
reviewSchema.index({ bookingId: 1 });
reviewSchema.index({ from: 1 });
reviewSchema.index({ to: 1 });
reviewSchema.index({ rating: 1 });

export const Review = mongoose.model<IReviewDocument>('Review', reviewSchema); 