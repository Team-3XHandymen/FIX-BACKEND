import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceProviderDocument extends Document {
  userId: string; // Clerk user ID
  name: string; // Handyman name
  serviceIds: string[];
  experience: string;
  rating: number;
  location: string; // Simple location string (e.g., "Kandy")
  coordinates?: { // Coordinates for distance calculations
    lat: number;
    lng: number;
  };
  bio: string;
  doneJobsCount: number;
  availability: {
    [key: string]: string[];
  };
}

const serviceProviderSchema = new Schema<IServiceProviderDocument>({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  serviceIds: [{
    type: String,
    required: true,
  }],
  experience: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  coordinates: {
    lat: Number,
    lng: Number,
  },
  bio: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  doneJobsCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  availability: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes for query optimization
serviceProviderSchema.index({ userId: 1 },{ unique: true});
serviceProviderSchema.index({ serviceIds: 1 });
serviceProviderSchema.index({ rating: -1 });
serviceProviderSchema.index({ location: 1 });

export const ServiceProvider = mongoose.model<IServiceProviderDocument>('ServiceProvider', serviceProviderSchema);
