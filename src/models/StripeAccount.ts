import mongoose, { Schema, Document } from 'mongoose';

export interface IStripeAccountDocument extends Document {
  userId: string; // Clerk user ID
  accountId: string; // Stripe connected account ID
  accountType: 'express' | 'standard' | 'custom';
  country: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
    pendingVerification: string[];
    disabledReason?: string;
  };
  capabilities: {
    cardPayments: boolean;
    transfers: boolean;
  };
  businessProfile?: {
    name?: string;
    url?: string;
    supportEmail?: string;
    supportPhone?: string;
  };
  settings?: {
    payouts?: {
      schedule?: {
        interval: 'daily' | 'weekly' | 'monthly';
        weeklyAnchor?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
        monthlyAnchor?: number;
      };
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const stripeAccountSchema = new Schema<IStripeAccountDocument>({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  accountId: {
    type: String,
    required: true,
    unique: true,
  },
  accountType: {
    type: String,
    enum: ['express', 'standard', 'custom'],
    required: true,
  },
  country: {
    type: String,
    required: true,
    length: 2, // ISO country code
  },
  chargesEnabled: {
    type: Boolean,
    default: false,
  },
  payoutsEnabled: {
    type: Boolean,
    default: false,
  },
  detailsSubmitted: {
    type: Boolean,
    default: false,
  },
  requirements: {
    currentlyDue: [String],
    eventuallyDue: [String],
    pastDue: [String],
    pendingVerification: [String],
    disabledReason: String,
  },
  capabilities: {
    cardPayments: {
      type: Boolean,
      default: false,
    },
    transfers: {
      type: Boolean,
      default: false,
    },
  },
  businessProfile: {
    name: String,
    url: String,
    supportEmail: String,
    supportPhone: String,
  },
  settings: {
    payouts: {
      schedule: {
        interval: {
          type: String,
          enum: ['daily', 'weekly', 'monthly'],
        },
        weeklyAnchor: {
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        },
        monthlyAnchor: Number,
      },
    },
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
stripeAccountSchema.index({ userId: 1 }, { unique: true });
stripeAccountSchema.index({ accountId: 1 }, { unique: true });
stripeAccountSchema.index({ chargesEnabled: 1, payoutsEnabled: 1 });

export const StripeAccount = mongoose.model<IStripeAccountDocument>('StripeAccount', stripeAccountSchema);
