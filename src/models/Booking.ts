import mongoose, { Schema, Document } from 'mongoose';

export interface IBookingDocument extends Document {
  status: 'pending' | 'confirmed' | 'cancelled' | 'done';
  description: string;
  fee: number | null;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  clientId: string; // Clerk User ID
  providerId: string; // Clerk User ID
  serviceId: string;
  // Store names directly for easy access
  providerName: string;
  serviceName: string;
  scheduledTime: Date;
  createdAt: Date;
}

const bookingSchema = new Schema<IBookingDocument>({
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'done'],
    default: 'pending',
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  fee: {
    type: Number,
    default: null,
    min: 0,
  },
  location: {
    address: {
      type: String,
      required: true,
      trim: true,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  clientId: {
    type: String,
    required: true,
  },
  providerId: {
    type: String,
    required: true,
  },
  serviceId: {
    type: String,
    required: true,
  },
  providerName: {
    type: String,
    required: true,
  },
  serviceName: {
    type: String,
    required: true,
  },
  scheduledTime: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// 🔽 Indexes (clean, non-duplicated)
bookingSchema.index({ clientId: 1, status: 1 });                       // For client-based booking queries
bookingSchema.index({ providerId: 1, status: 1 });                     // For provider-based booking queries
bookingSchema.index({ serviceId: 1 });                                 // For filtering by service
bookingSchema.index({ status: 1 });                                    // For filtering by booking status
bookingSchema.index({ scheduledTime: 1 });                             // For filtering or sorting by date/time

export const Booking = mongoose.model<IBookingDocument>('Booking', bookingSchema);
