import mongoose, { Schema, Document } from 'mongoose';

export interface IProviderPrivateDataDocument extends Document {
  userId: string; // Clerk user ID
  // Personal Information
  name: string;
  nic: string;
  contactNumber: string;
  emailAddress: string;
  personalPhoto: string;
  
  // Professional Information
  skills: string[];
  experience: number; // Number of years
  certifications: string[];
  services: string[]; // Service IDs from services collection
  
  // Location & Availability
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
  availability: {
    workingDays: string;
    workingHours: string;
  };
  
  // Payment & Business
  paymentMethod: string;
  
  // System Data
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
  // Personal Information
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
  
  // Professional Information
  skills: [{
    type: String,
    trim: true,
  }],
  experience: {
    type: Number,
    required: true,
    min: 0,
  },
  certifications: [{
    type: String,
    trim: true,
  }],
  services: [{
    type: String,
    required: true,
  }],
  
  // Location & Availability
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
  
  // Payment & Business
  paymentMethod: {
    type: String,
    required: true,
    trim: true,
  },
  
  // System Data
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
providerPrivateDataSchema.index({ 'address.city': 1, 'address.state': 1 });
providerPrivateDataSchema.index({ services: 1 });
providerPrivateDataSchema.index({ skills: 1 });

export const ProviderPrivateData = mongoose.model<IProviderPrivateDataDocument>('ProviderPrivateData', providerPrivateDataSchema); 