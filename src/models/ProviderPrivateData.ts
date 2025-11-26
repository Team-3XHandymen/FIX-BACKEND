import mongoose, { Schema, Document } from 'mongoose';

export interface IProviderPrivateDataDocument extends Document {
  userId: string; // Clerk user ID
  name: string;
  nic: string;
  contactNumber: string;
  emailAddress: string;
  personalPhoto: string;
  experience: number;
  certifications: string[];
  certificate?: string; // Base64 encoded certificate file
  services: string[];
  location: string; // Simple location string (e.g., "Kandy")
  coordinates?: { // Coordinates for distance calculations
    lat: number;
    lng: number;
  };
  address?: { // Make address optional
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  availability: {
    workingDays: string;
    workingHours: string;
  };
  paymentMethod: string;
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
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  nic: {
    type: String,
    required: true,
    trim: true,
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true,
  },
  emailAddress: {
    type: String,
    required: true,
    trim: true,
  },
  personalPhoto: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
    min: 0,
  },
  certifications: [{
    type: String,
    trim: true,
  }],
  certificate: {
    type: String, // Base64 encoded certificate file
  },
  services: [{
    type: String,
    required: true,
  }],
  location: {
    type: String,
    required: true,
    trim: true,
  },
  coordinates: {
    lat: Number,
    lng: Number,
  },
  address: {
    street: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  availability: {
    workingDays: {
      type: String,
      required: true,
      trim: true,
    },
    workingHours: {
      type: String,
      required: true,
      trim: true,
    },
  },
  paymentMethod: {
    type: String,
    required: true,
    trim: true,
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

// ✅ Centralized, optimized indexes
providerPrivateDataSchema.index({ userId: 1 }, { unique: true, sparse: true  });                  // Unique index for userId
providerPrivateDataSchema.index({ 'address.city': 1, 'address.state': 1 });        // For location-based filtering
providerPrivateDataSchema.index({ services: 1 });                                  // For filtering by service
providerPrivateDataSchema.index({ location: 1 });                                  // For filtering by location

export const ProviderPrivateData = mongoose.model<IProviderPrivateDataDocument>(
  'ProviderPrivateData',
  providerPrivateDataSchema
);
