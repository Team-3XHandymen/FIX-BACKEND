import mongoose, { Schema, Document } from 'mongoose';

export interface ICallDocument extends Document {
  bookingId: string;
  callerId: string; // Clerk user ID of the caller
  receiverId: string; // Clerk user ID of the receiver
  callerName: string;
  receiverName: string;
  callSid?: string; // Twilio Call SID
  status: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'canceled';
  duration?: number; // Duration in seconds
  direction: 'outbound' | 'inbound';
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const callSchema = new Schema<ICallDocument>({
  bookingId: {
    type: String,
    required: true,
    index: true,
  },
  callerId: {
    type: String,
    required: true,
    index: true,
  },
  receiverId: {
    type: String,
    required: true,
    index: true,
  },
  callerName: {
    type: String,
    required: true,
  },
  receiverName: {
    type: String,
    required: true,
  },
  callSid: {
    type: String,
    index: true,
  },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'in-progress', 'completed', 'failed', 'canceled'],
    default: 'initiated',
    index: true,
  },
  duration: {
    type: Number,
  },
  direction: {
    type: String,
    enum: ['outbound', 'inbound'],
    required: true,
  },
  startedAt: {
    type: Date,
  },
  endedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
callSchema.index({ bookingId: 1, createdAt: -1 });
callSchema.index({ callerId: 1, createdAt: -1 });
callSchema.index({ receiverId: 1, createdAt: -1 });

export const Call = mongoose.model<ICallDocument>('Call', callSchema);

