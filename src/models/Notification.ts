import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDocument extends Document {
  userId: string; // Clerk user ID
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// ✅ Optimized indexes — no duplicates
notificationSchema.index({ userId: 1, read: 1 });  // For filtering unread/read per user
notificationSchema.index({ createdAt: -1 });       // For sorting by latest notifications

export const Notification = mongoose.model<INotificationDocument>('Notification', notificationSchema);
