import mongoose, { Schema, Document } from 'mongoose';

export interface IGoogleCalendarDocument extends Document {
  userId: string; // Clerk user ID
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
  calendarId?: string; // Primary calendar ID
  connectedAt: Date;
  lastSyncedAt?: Date;
}

const googleCalendarSchema = new Schema<IGoogleCalendarDocument>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  tokenExpiry: {
    type: Date,
    required: true,
  },
  calendarId: {
    type: String,
    default: 'primary', // Default to primary calendar
  },
  connectedAt: {
    type: Date,
    default: Date.now,
  },
  lastSyncedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

export const GoogleCalendar = mongoose.model<IGoogleCalendarDocument>('GoogleCalendar', googleCalendarSchema);

