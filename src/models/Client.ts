import mongoose, { Schema, Document } from 'mongoose';

export interface IClientDocument extends Document {
  userId: string; // Clerk user ID
  username: string; // Username from Clerk
  email: string; // Email from Clerk
  name?: string; // Optional until profile completion
  mobileNumber?: string; // Optional until profile completion
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }; // Optional until profile completion
  location?: string; // Optional until profile completion
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
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: false,
    trim: true,
  },
  mobileNumber: {
    type: String,
    required: false,
    trim: true,
  },
  address: {
    street: {
      type: String,
      required: false,
      trim: true,
    },
    city: {
      type: String,
      required: false,
      trim: true,
    },
    state: {
      type: String,
      required: false,
      trim: true,
    },
    zipCode: {
      type: String,
      required: false,
      trim: true,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  location: {
    type: String,
    required: false,
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


clientSchema.index({ userId: 1 });                           // Unique index for Clerk user ID only
clientSchema.index({ email: 1 });                                             // Index for email lookups (not unique)
clientSchema.index({ username: 1 });                                          // Index for username lookups (not unique)
clientSchema.index({ 'address.city': 1, 'address.state': 1 });                // For filtering by city/state
clientSchema.index({ location: 1 });                                          // For general region filtering

export const Client = mongoose.model<IClientDocument>('Client', clientSchema);
