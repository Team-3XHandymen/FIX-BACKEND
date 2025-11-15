import twilio from 'twilio';
import { config } from './env';

// Initialize Twilio Client
export const twilioClient = twilio(
  config.TWILIO_ACCOUNT_SID,
  config.TWILIO_AUTH_TOKEN
);

// Twilio Access Token Generator for browser-based calls
export const generateAccessToken = (identity: string): string => {
  if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio Account SID and Auth Token are required');
  }

  if (!config.TWILIO_API_KEY_SID || !config.TWILIO_API_KEY_SECRET) {
    throw new Error('Twilio API Key SID and Secret are required. Please create an API Key in Twilio Console.');
  }

  try {
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    // Create a voice grant for browser calls
    // Include outgoingApplicationSid to enable outbound calls (31002 fix)
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: config.TWILIO_TWIML_APP_SID || undefined,
      incomingAllow: true,
    });

    // Log credential details for debugging (without exposing secrets)
    console.log('🔍 Token generation config:', {
      accountSid: config.TWILIO_ACCOUNT_SID ? `${config.TWILIO_ACCOUNT_SID.substring(0, 8)}...` : 'MISSING',
      apiKeySid: config.TWILIO_API_KEY_SID ? `${config.TWILIO_API_KEY_SID.substring(0, 8)}...` : 'MISSING',
      apiKeySecretLength: config.TWILIO_API_KEY_SECRET ? config.TWILIO_API_KEY_SECRET.length : 0,
      identity,
    });

    // Create an access token with the grant
    const token = new AccessToken(
      config.TWILIO_ACCOUNT_SID,
      config.TWILIO_API_KEY_SID,
      config.TWILIO_API_KEY_SECRET,
      { 
      identity,
        ttl: 3600 // Token expires in 1 hour
      }
    );

    token.addGrant(voiceGrant);

    const jwtToken = token.toJwt();
    
    console.log('✅ Token generated successfully for identity:', identity);
    console.log('🔍 Token length:', jwtToken.length);
    
    return jwtToken;
  } catch (error: any) {
    console.error('❌ Error in generateAccessToken:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to generate access token: ${error.message}`);
  }
};

// Twilio Configuration
export const TWILIO_CONFIG = {
  PHONE_NUMBER: config.TWILIO_PHONE_NUMBER,
  ACCOUNT_SID: config.TWILIO_ACCOUNT_SID,
  ENABLE_CALLING: config.ENABLE_CALLING,
};

