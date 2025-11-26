import { Request, Response } from 'express';
import { generateAccessToken, twilioClient } from '../config/twilio';
import { config } from '../config/env';
import { Call } from '../models/Call';
import { Booking } from '../models/Booking';
import { Client } from '../models/Client';
import { ServiceProvider } from '../models/ServiceProvider';
import { ProviderPrivateData } from '../models/ProviderPrivateData';

/**
 * Generate an access token for a user to make voice calls
 */
export const getAccessToken = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { userType } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Generate identity (use userId + userType to ensure uniqueness)
    const identity = `${userId}_${userType || 'user'}`;

    // Validate Twilio config before generating token
    if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_API_KEY_SID || !config.TWILIO_API_KEY_SECRET) {
      console.error('❌ Twilio configuration missing:', {
        hasAccountSid: !!config.TWILIO_ACCOUNT_SID,
        hasApiKeySid: !!config.TWILIO_API_KEY_SID,
        hasApiKeySecret: !!config.TWILIO_API_KEY_SECRET,
      });
      return res.status(500).json({
        success: false,
        message: 'Twilio configuration incomplete. Please check environment variables.',
      });
    }

    // Generate access token
    let token: string;
    try {
      token = generateAccessToken(identity);
      console.log('📞 Generated access token for user:', identity);
    } catch (error: any) {
      console.error('❌ Token generation error:', error);
      return res.status(500).json({
        success: false,
        message: `Failed to generate access token: ${error.message}`,
      });
    }

    res.json({
      success: true,
      data: {
        token,
        identity,
      },
    });
  } catch (error) {
    console.error('❌ Error generating access token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate access token',
    });
  }
};

/**
 * Get contact phone number for the other party in a booking
 */
export const getContactNumber = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id;
    const userType = req.user?.type || req.query.userType;

    if (!userId || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and user authentication required',
      });
    }

    // Get booking details
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Determine other party's ID
    let otherPartyId: string;
    let otherPartyName: string = '';
    let otherPartyPhone: string = '';

    if (userType === 'client') {
      otherPartyId = booking.providerId;
      otherPartyName = booking.providerName || 'Provider';
      
      // Get provider's contact number
      const provider = await ProviderPrivateData.findOne({ userId: otherPartyId });
      if (provider) {
        otherPartyPhone = provider.contactNumber || '';
      }
    } else {
      otherPartyId = booking.clientId;
      otherPartyName = booking.clientName || 'Client';
      
      // Get client's contact number
      const client = await Client.findOne({ userId: otherPartyId });
      if (client) {
        otherPartyPhone = client.mobileNumber || '';
      }
    }

    // Generate identity for the other party
    const otherPartyIdentity = `${otherPartyId}_${userType === 'client' ? 'provider' : 'client'}`;

    res.json({
      success: true,
      data: {
        otherPartyId,
        otherPartyIdentity,
        otherPartyName,
        otherPartyPhone: otherPartyPhone || null, // Only return if available
      },
    });
  } catch (error) {
    console.error('❌ Error getting contact number:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contact information',
    });
  }
};

/**
 * Initiate a call and create call record
 */
export const initiateCall = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user?.id;
    const userType = req.user?.type || req.query.userType;

    if (!userId || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and user authentication required',
      });
    }

    // Get booking details
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Determine caller and receiver
    const isClient = userType === 'client';
    const callerId = userId;
    const receiverId = isClient ? booking.providerId : booking.clientId;
    const callerName = isClient ? (booking.clientName || 'Client') : (booking.providerName || 'Provider');
    const receiverName = isClient ? (booking.providerName || 'Provider') : (booking.clientName || 'Client');

    // Create call record
    const call = new Call({
      bookingId,
      callerId,
      receiverId,
      callerName,
      receiverName,
      status: 'initiated',
      direction: 'outbound',
      startedAt: new Date(),
    });

    await call.save();

    console.log('📞 Call initiated:', {
      callId: call._id,
      bookingId,
      callerId,
      receiverId,
    });

    res.json({
      success: true,
      message: 'Call initiated',
      data: {
        callId: call._id,
        bookingId,
        callerId,
        receiverId,
        callerIdentity: `${callerId}_${userType}`,
        receiverIdentity: `${receiverId}_${isClient ? 'provider' : 'client'}`,
      },
    });
  } catch (error) {
    console.error('❌ Error initiating call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate call',
    });
  }
};

/**
 * Update call status (called by Twilio webhooks)
 */
export const updateCallStatus = async (req: Request, res: Response) => {
  try {
    const { CallSid, CallStatus, CallDuration } = req.body;

    if (!CallSid) {
      return res.status(400).json({
        success: false,
        message: 'Call SID is required',
      });
    }

    // Find call by CallSid
    const call = await Call.findOneAndUpdate(
      { callSid: CallSid },
      {
        callSid: CallSid,
        status: mapTwilioStatus(CallStatus),
        duration: CallDuration ? parseInt(CallDuration) : undefined,
        ...(CallStatus === 'in-progress' && { startedAt: new Date() }),
        ...(CallStatus === 'completed' && { endedAt: new Date() }),
        ...(CallStatus === 'failed' && { endedAt: new Date() }),
      },
      { new: true }
    );

    if (call) {
      console.log('📞 Call status updated:', {
        callId: call._id,
        callSid: CallSid,
        status: CallStatus,
      });
    }

    // Twilio expects TwiML response
    res.type('text/xml');
    res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  } catch (error) {
    console.error('❌ Error updating call status:', error);
    res.type('text/xml');
    res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  }
};

/**
 * Get call history for a booking
 */
export const getCallHistory = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id;

    if (!userId || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and user authentication required',
      });
    }

    // Get calls for this booking where user is either caller or receiver
    const calls = await Call.find({
      bookingId,
      $or: [
        { callerId: userId },
        { receiverId: userId },
      ],
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: calls,
    });
  } catch (error) {
    console.error('❌ Error getting call history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get call history',
    });
  }
};

/**
 * Map Twilio call status to our internal status
 */
function mapTwilioStatus(twilioStatus: string): 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'canceled' {
  const statusMap: Record<string, 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'canceled'> = {
    'queued': 'initiated',
    'ringing': 'ringing',
    'in-progress': 'in-progress',
    'completed': 'completed',
    'failed': 'failed',
    'busy': 'failed',
    'no-answer': 'failed',
    'canceled': 'canceled',
  };

  return statusMap[twilioStatus] || 'failed';
}

