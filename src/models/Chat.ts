import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
}

export interface IChatDocument extends Document {
  bookingId: string;
  messages: IChatMessage[];
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
  senderId: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new Schema<IChatDocument>({
  bookingId: {
    type: String,
    required: true,
    unique: true,
  },
  messages: [chatMessageSchema],
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
chatSchema.index({ bookingId: 1 });
chatSchema.index({ lastMessageAt: -1 });

export const Chat = mongoose.model<IChatDocument>('Chat', chatSchema);
