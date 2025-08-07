import mongoose, { Schema, Document } from 'mongoose';

export interface IClientDocument extends Document {
  userId: string; // Clerk user ID
  name: string;
  mobileNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  location: string; // General region
  rating?: number;
  preferences?: {
    preferredServices?: string[];
    preferredTimes?: string[];
    [key: string]: any;
  };
}

const clientSchema = new Schema<IClientDocument>({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  preferences: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// ✅ Define indexes cleanly here — NO duplicate field-based `index: true`
clientSchema.index({ userId: 1 }, { unique: true });                           // Unique index for Clerk user ID
clientSchema.index({ 'address.city': 1, 'address.state': 1 });                // For filtering by city/state
clientSchema.index({ location: 1 });                                          // For general region filtering

export const Client = mongoose.model<IClientDocument>('Client', clientSchema);
