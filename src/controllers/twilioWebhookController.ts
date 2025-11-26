import { Request, Response } from 'express';
import { Call } from '../models/Call';

/**
 * Handle Twilio TwiML webhook for outbound calls
 * This generates TwiML instructions for connecting the call
 */
export const handleOutboundCall = async (req: Request, res: Response) => {
  try {
    const { To, From, CallSid } = req.body;

    console.log('📞 Outbound call webhook:', { To, From, CallSid });

    // Update call record with CallSid if we have the booking ID
    // Note: You might need to pass bookingId via URL parameter
    const bookingId = req.query.bookingId as string;
    if (bookingId && CallSid) {
      await Call.findOneAndUpdate(
        { bookingId, status: 'initiated' },
        { callSid: CallSid, status: 'ringing' }
      );
    }

    // Generate TwiML to dial the recipient
    // For browser-to-browser calls, we dial the recipient's client identity
    // Note: For browser-to-browser, both parties connect via Twilio Client SDK
    // This webhook is mainly for logging
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Client>${To}</Client>
  </Dial>
</Response>`;

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('❌ Error handling outbound call:', error);
    res.type('text/xml');
    res.send('<?xml version="1.0" encoding="UTF-8"?><Response><Say>An error occurred connecting the call.</Say></Response>');
  }
};

/**
 * Handle Twilio status callback webhook
 */
export const handleCallStatus = async (req: Request, res: Response) => {
  try {
    const { CallSid, CallStatus, CallDuration, To, From } = req.body;

    console.log('📞 Call status callback:', {
      CallSid,
      CallStatus,
      CallDuration,
      To,
      From,
    });

    // Update call record
    const call = await Call.findOneAndUpdate(
      { callSid: CallSid },
      {
        status: mapTwilioStatus(CallStatus),
        duration: CallDuration ? parseInt(CallDuration) : undefined,
        ...(CallStatus === 'in-progress' && { startedAt: new Date() }),
        ...(CallStatus === 'completed' && { endedAt: new Date() }),
        ...(['failed', 'busy', 'no-answer', 'canceled'].includes(CallStatus) && { endedAt: new Date() }),
      },
      { new: true }
    );

    if (call) {
      console.log('✅ Call status updated:', call._id, CallStatus);
    }

    res.type('text/xml');
    res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  } catch (error) {
    console.error('❌ Error handling call status:', error);
    res.type('text/xml');
    res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  }
};

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

