import mongoose, { Schema, Document } from 'mongoose';

export interface IProviderPrivateDataDocument extends Document {
  userId: string; // Clerk user ID
  totalEarnings: number;
  upcomingBookings: string[];
  schedule: {
    [key: string]: any;
  };
  notifications: Array<{
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
  }>;
  oldBookings: string[];
}

const providerPrivateDataSchema = new Schema<IProviderPrivateDataDocument>({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0,
  },
  upcomingBookings: [{
    type: String,
  }],
  schedule: {
    type: Schema.Types.Mixed,
    default: {},
  },
  notifications: [{
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  oldBookings: [{
    type: String,
  }],
}, {
  timestamps: true,
});

// Index for better query performance
providerPrivateDataSchema.index({ userId: 1 });

export const ProviderPrivateData = mongoose.model<IProviderPrivateDataDocument>('ProviderPrivateData', providerPrivateDataSchema); 