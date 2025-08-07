import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceDocument extends Document {
  serviceId?: string;
  name: string;
  description: string;
  baseFee: number;
  imageUrl?: string;
  usageCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const serviceSchema = new Schema<IServiceDocument>(
  {
    serviceId: {
      type: String,
      sparse: true, // Allows multiple docs without this field
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
      trim: true,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Auto-generate `serviceId` from `_id` if not provided
serviceSchema.pre<IServiceDocument>('save', function (next) {
  if (!this.serviceId && this._id) {
    this.serviceId = this._id.toString();
  }
  next();
});

// Optional: Indexes for frequent queries
serviceSchema.index({ name: 1 });
serviceSchema.index({ usageCount: -1 });

export const Service = mongoose.model<IServiceDocument>('Service', serviceSchema);
