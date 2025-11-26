import { google } from 'googleapis';
import { GoogleCalendar } from '../models/GoogleCalendar';

// Get backend URL from environment or default to localhost
const getBackendUrl = () => {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://fixfinder-backend-zrn7.onrender.com';
  }
  return 'http://localhost:3001';
};

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `${getBackendUrl()}/api/google-calendar/callback`
);

export class GoogleCalendarService {
  /**
   * Get OAuth2 authorization URL
   */
  static getAuthUrl(userId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: userId, // Pass userId in state for verification
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  static async exchangeCodeForTokens(code: string, userId: string): Promise<void> {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      
      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Failed to get access and refresh tokens');
      }

      // Calculate token expiry (usually expires in 1 hour)
      const tokenExpiry = tokens.expiry_date 
        ? new Date(tokens.expiry_date)
        : new Date(Date.now() + 3600 * 1000); // Default to 1 hour

      // Save or update tokens in database
      await GoogleCalendar.findOneAndUpdate(
        { userId },
        {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: tokenExpiry,
          connectedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      console.log(`✅ Google Calendar connected for user: ${userId}`);
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  /**
   * Get authenticated OAuth2 client for a user
   */
  static async getAuthenticatedClient(userId: string) {
    const calendarData = await GoogleCalendar.findOne({ userId });

    if (!calendarData) {
      throw new Error('Google Calendar not connected for this user');
    }

    // Check if token is expired and refresh if needed
    if (new Date() >= calendarData.tokenExpiry) {
      await this.refreshAccessToken(userId);
      // Reload calendar data after refresh
      const refreshedData = await GoogleCalendar.findOne({ userId });
      if (!refreshedData) {
        throw new Error('Failed to refresh calendar tokens');
      }
      oauth2Client.setCredentials({
        access_token: refreshedData.accessToken,
        refresh_token: refreshedData.refreshToken,
      });
    } else {
      oauth2Client.setCredentials({
        access_token: calendarData.accessToken,
        refresh_token: calendarData.refreshToken,
      });
    }

    return oauth2Client;
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(userId: string): Promise<void> {
    const calendarData = await GoogleCalendar.findOne({ userId });

    if (!calendarData) {
      throw new Error('Google Calendar not connected');
    }

    oauth2Client.setCredentials({
      refresh_token: calendarData.refreshToken,
    });

    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      if (!credentials.access_token) {
        throw new Error('Failed to refresh access token');
      }

      const tokenExpiry = credentials.expiry_date 
        ? new Date(credentials.expiry_date)
        : new Date(Date.now() + 3600 * 1000);

      await GoogleCalendar.findOneAndUpdate(
        { userId },
        {
          accessToken: credentials.access_token,
          tokenExpiry: tokenExpiry,
        }
      );

      console.log(`✅ Access token refreshed for user: ${userId}`);
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  /**
   * Create a calendar event for a booking
   */
  static async createBookingEvent(
    userId: string,
    booking: {
      _id: string;
      serviceName: string;
      clientName?: string;
      scheduledTime: Date;
      location: { address: string };
      description: string;
      fee?: number | null;
    }
  ): Promise<string> {
    try {
      const auth = await this.getAuthenticatedClient(userId);
      const calendar = google.calendar({ version: 'v3', auth });

      const calendarData = await GoogleCalendar.findOne({ userId });
      const calendarId = calendarData?.calendarId || 'primary';

      // Format event details
      const startTime = new Date(booking.scheduledTime);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

      const event = {
        summary: `${booking.serviceName} - ${booking.clientName || 'Client'}`,
        description: `Booking ID: ${booking._id}\n\n${booking.description}\n\nLocation: ${booking.location.address}${booking.fee ? `\nFee: $${booking.fee}` : ''}`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'Asia/Colombo', // Sri Lanka timezone
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'Asia/Colombo',
        },
        location: booking.location.address,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 60 }, // 1 hour before
          ],
        },
        source: {
          title: 'FixFinder Booking',
          url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/handyman/dashboard`,
        },
      };

      const response = await calendar.events.insert({
        calendarId: calendarId,
        requestBody: event,
      });

      console.log(`✅ Calendar event created: ${response.data.id} for booking: ${booking._id}`);

      return response.data.id || '';
    } catch (error: any) {
      console.error('Error creating calendar event:', error);
      throw new Error(`Failed to create calendar event: ${error.message}`);
    }
  }

  /**
   * Check if Google Calendar is connected for a user
   */
  static async isConnected(userId: string): Promise<boolean> {
    const calendarData = await GoogleCalendar.findOne({ userId });
    return !!calendarData;
  }

  /**
   * Disconnect Google Calendar
   */
  static async disconnect(userId: string): Promise<void> {
    await GoogleCalendar.findOneAndDelete({ userId });
    console.log(`✅ Google Calendar disconnected for user: ${userId}`);
  }
}

