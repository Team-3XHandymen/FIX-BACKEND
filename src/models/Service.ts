import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceDocument extends Document {
  serviceId?: string;
  name: string;
  description: string;
  baseFee: number;
  imageUrl?: string;
  usageCount?: number;
}

const serviceSchema = new Schema<IServiceDocument>({
  serviceId: {
    type: String,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  baseFee: {
    type: Number,
    required: true,
    min: 0,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

// Auto-generate serviceId if not provided
serviceSchema.pre('save', function(next) {
  if (!this.serviceId && this._id) {
    this.serviceId = this._id.toString();
  }
  next();
});

export const Service = mongoose.model<IServiceDocument>('Service', serviceSchema); 