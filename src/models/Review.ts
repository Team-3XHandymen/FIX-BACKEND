import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewDocument extends Document {
  bookingId: string;
  from: string; // Client ID
  to: string;   // Service Provider ID
  rating: number; // 1–5 stars
  comment: string;
  shortDescription?: string; // Brief 1-2 word description
  selectedIssues?: string[]; // Array of selected issue categories
  detailedFeedback?: string; // Optional detailed feedback text
  createdAt: Date;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    bookingId: {
      type: String,
      required: true,
       // One review per booking
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
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    selectedIssues: {
      type: [String],
      default: [],
    },
    detailedFeedback: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ bookingId: 1 },{ unique: true, sparse: true });              // for lookup by booking
reviewSchema.index({ to: 1 });                     // for provider's reviews
reviewSchema.index({ from: 1 });                   // for client's review history
reviewSchema.index({ to: 1, rating: -1 });         // useful for sorting/filtering provider's reviews
reviewSchema.index({ createdAt: -1 });             // for recent reviews

export const Review = mongoose.model<IReviewDocument>('Review', reviewSchema);
