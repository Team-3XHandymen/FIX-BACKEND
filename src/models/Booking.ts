import mongoose, { Schema, Document } from 'mongoose';

export interface IBookingDocument extends Document {
  bookingId?: string;
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
  scheduledTime: Date;
  createdAt: Date;
}

const bookingSchema = new Schema<IBookingDocument>({
  bookingId: {
    type: String,
    unique: true,
    sparse: true,
  },
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

// Auto-generate bookingId if not provided
bookingSchema.pre('save', function(next) {
  if (!this.bookingId && this._id) {
    this.bookingId = this._id.toString();
  }
  next();
});

// Index for better query performance
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ clientId: 1, status: 1 });
bookingSchema.index({ providerId: 1, status: 1 });
bookingSchema.index({ serviceId: 1 });
bookingSchema.index({ scheduledTime: 1 });
bookingSchema.index({ status: 1 });

export const Booking = mongoose.model<IBookingDocument>('Booking', bookingSchema); 