import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentDocument extends Document {
  bookingId: string; // Reference to the booking
  paymentIntentId: string; // Stripe PaymentIntent ID
  sessionId?: string; // Stripe Checkout Session ID (if using Checkout)
  amountCents: number; // Amount in cents
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
  applicationFeeCents: number; // Platform fee in cents
  providerAccountId: string; // Stripe connected account ID
  clientId: string; // Clerk user ID of client
  providerId: string; // Clerk user ID of provider
  metadata?: {
    bookingId: string;
    serviceName?: string;
    providerName?: string;
    clientName?: string;
  };
  refunds?: Array<{
    refundId: string;
    amountCents: number;
    reason?: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPaymentDocument>({
  bookingId: {
    type: String,
    required: true,
  },
  paymentIntentId: {
    type: String,
    required: true,
  },
  sessionId: {
    type: String,
  },
  amountCents: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    default: 'usd',
    length: 3,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded'],
    default: 'pending',
  },
  applicationFeeCents: {
    type: Number,
    required: true,
    min: 0,
  },
  providerAccountId: {
    type: String,
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  providerId: {
    type: String,
    required: true,
  },
  metadata: {
    bookingId: String,
    serviceName: String,
    providerName: String,
    clientName: String,
  },
  refunds: [{
    refundId: {
      type: String,
      required: true,
    },
    amountCents: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Indexes for efficient querying
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ paymentIntentId: 1 }, { unique: true });
paymentSchema.index({ sessionId: 1 }, { sparse: true });
paymentSchema.index({ clientId: 1, status: 1 });
paymentSchema.index({ providerId: 1, status: 1 });
paymentSchema.index({ providerAccountId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.model<IPaymentDocument>('Payment', paymentSchema);
