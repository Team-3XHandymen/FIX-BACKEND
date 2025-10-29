# Twilio Voice Calling Setup Guide

This guide will help you set up Twilio voice calling functionality for your FIX platform, allowing clients and handymen to make voice calls within the chat room.

## 📋 Prerequisites

1. **Twilio Account** (Free tier works for testing)
   - Sign up at: https://www.twilio.com/try-twilio
   - Get your Account SID and Auth Token from the Twilio Console

2. **Twilio Phone Number**
   - Purchase a phone number in the Twilio Console
   - This is used for the voice calls
   - Free trial accounts come with $15.50 credit (enough for testing)

## 🔧 Step 1: Get Twilio Credentials

1. Log in to your Twilio Console: https://console.twilio.com/
2. Go to Account → API Keys & Tokens
3. Note down:
   - **Account SID**: Starts with `AC...`
   - **Auth Token**: Your authentication token
   - **API Key SID**: Create a new API Key and note the SID
   - **API Key Secret**: The secret for your API Key

## 📞 Step 2: Purchase a Twilio Phone Number

1. In Twilio Console, go to Phone Numbers → Buy a number
2. Select a number with **Voice** capability
3. Purchase the number (included in free trial credit)

## 🔐 Step 3: Configure Backend Environment Variables

Add these to your `.env` file in `FIX-BACKEND`:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_API_KEY_SID=your_api_key_sid_here
TWILIO_API_KEY_SECRET=your_api_key_secret_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number (e.g., +1234567890)
TWILIO_APP_SID=your_twiml_app_sid (optional, for advanced features)
```

**For Render Deployment:**
Add these same environment variables in your Render dashboard under Environment Variables.

## 🚀 Step 4: Install Dependencies

Run in your backend directory:
```bash
cd FIX-BACKEND
npm install twilio @twilio/voice-sdk
npm install --save-dev @types/twilio  # For TypeScript
```

## 📝 Step 5: Backend Implementation

All necessary files have been created:
1. ✅ `src/config/twilio.ts` - Twilio configuration
2. ✅ `src/controllers/callController.ts` - Call logic
3. ✅ `src/controllers/twilioWebhookController.ts` - Webhook handlers
4. ✅ `src/routes/call.routes.ts` - API routes
5. ✅ `src/models/Call.ts` - Call history model

Routes registered in `src/index.ts`:
- `GET /api/calls/token` - Get access token
- `GET /api/calls/contact/:bookingId` - Get contact info
- `POST /api/calls/initiate` - Initiate call
- `GET /api/calls/history/:bookingId` - Get call history
- `POST /api/calls/webhook/outbound` - Twilio outbound webhook
- `POST /api/calls/webhook/status` - Twilio status webhook

## 🎯 How It Works

### Browser-to-Browser Calling (Recommended for Chat)
- Uses Twilio Client JS SDK
- Both users call each other via browser
- Works in the chat interface
- No phone numbers needed for users

### Browser-to-Phone Calling (Alternative)
- One party uses browser, other uses phone
- Requires phone numbers
- More expensive but works if user is offline

For the chat room, we'll implement **Browser-to-Browser** calling which is:
- Free (for testing)
- Works directly in browser
- Doesn't require user phone numbers

## 🧪 Testing Setup

### 1. Local Development
1. Use ngrok or similar to expose your backend:
   ```bash
   ngrok http 3001
   ```
2. Update your TwiML app webhook URLs to use ngrok URL
3. Test calling between two browser tabs

### 2. Production Deployment
1. Deploy backend to Render
2. Update TwiML app webhook URLs to your Render URL
3. Test calling functionality

## 📊 Twilio Trial Limitations

**Free Tier Includes:**
- $15.50 credit for testing
- Can make calls to verified phone numbers
- Limited minutes (varies by country)

**To Test:**
1. Verify your phone number in Twilio Console
2. Call your verified number from the chat interface
3. Test browser-to-browser calling (free for both sides)

## 🔒 Security Notes

1. **Access Tokens**: Generated server-side, never expose credentials
2. **Rate Limiting**: Implement to prevent abuse
3. **Call Logging**: Optional but recommended for moderation

## 📞 Next Steps

After setup, you can:
1. Make calls from the chat interface
2. View call history
3. Receive call notifications
4. Integrate with booking system

For detailed API documentation, see: https://www.twilio.com/docs/voice

