# Google Calendar Integration Setup Guide

This guide explains how to set up Google Calendar integration for automatic booking calendar events.

## Overview

When a booking is paid by a customer, the system automatically creates a Google Calendar event on the handyman's Google Calendar with:
- Service name and client information
- Scheduled date and time
- Location address
- Reminders: 1 day before (email) and 1 hour before (popup)

## Prerequisites

1. Google Cloud Platform account
2. A Google Cloud Project
3. OAuth 2.0 credentials configured

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

## Step 2: Enable Google Calendar API

1. In Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Calendar API"**
3. Click on it and click **"ENABLE"**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen:
   - **User Type**: External (for testing) or Internal (for Google Workspace)
   - **App name**: FixFinder
   - **User support email**: Your email
   - **Developer contact**: Your email
   - **Scopes**: Add `https://www.googleapis.com/auth/calendar` and `https://www.googleapis.com/auth/calendar.events`
   - **Test users**: Add your test email addresses
4. Create OAuth client ID:
   - **Application type**: Web application
   - **Name**: FixFinder Calendar Integration
   - **Authorized JavaScript origins**:
     ```
     http://localhost:8080
     https://fix-frontend.netlify.app
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:8080/api/google-calendar/callback
     https://fix-frontend.netlify.app/api/google-calendar/callback
     https://your-backend-url.onrender.com/api/google-calendar/callback
     ```
5. Click **"CREATE"**
6. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Environment Variables

### Backend (.env)

Add these variables to your backend `.env` file:

```env
# Google Calendar OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-backend-url.onrender.com/api/google-calendar/callback

# Frontend URL (for redirects)
FRONTEND_URL=https://fix-frontend.netlify.app
```

**Important Notes:**
- For local development, use `http://localhost:8080/api/google-calendar/callback`
- For production, use your deployed backend URL
- The redirect URI must exactly match one of the authorized redirect URIs in Google Cloud Console

### Frontend

No additional environment variables needed for the frontend. The integration uses the backend API.

## Step 5: Deploy and Test

1. **Deploy Backend** with the new environment variables
2. **Deploy Frontend** (no changes needed)
3. **Test the Integration**:
   - Log in as a handyman
   - Go to Settings page
   - Click "Connect Google Calendar"
   - Authorize the application
   - You should be redirected back with a success message
   - Create a test booking and complete payment
   - Check your Google Calendar for the event

## How It Works

1. **Handyman connects Google Calendar**:
   - Clicks "Connect Google Calendar" in Settings
   - Redirected to Google OAuth consent screen
   - Authorizes the application
   - Redirected back with authorization code
   - Backend exchanges code for access/refresh tokens
   - Tokens stored in database

2. **Booking Payment**:
   - Customer pays for booking via Stripe
   - Stripe webhook triggers payment success handler
   - System checks if handyman has connected Google Calendar
   - If connected, creates calendar event with booking details
   - Event includes reminders (1 day email, 1 hour popup)

3. **Token Refresh**:
   - Access tokens expire after 1 hour
   - System automatically refreshes tokens using refresh token
   - No manual intervention needed

## Troubleshooting

### "Redirect URI mismatch" Error

- Ensure the redirect URI in `.env` exactly matches one in Google Cloud Console
- Check for trailing slashes or protocol differences (http vs https)

### "Access denied" Error

- Verify OAuth consent screen is configured
- Add test users if using "External" user type
- Check that required scopes are added

### Calendar Events Not Created

- Check backend logs for errors
- Verify handyman has connected Google Calendar
- Ensure booking status is 'paid'
- Check that Google Calendar API is enabled

### Token Refresh Issues

- Verify refresh token is stored correctly
- Check token expiry dates
- Review backend logs for refresh errors

## Security Notes

- Never commit `.env` files with credentials
- Use environment variables in production
- Regularly rotate OAuth credentials
- Monitor API usage in Google Cloud Console
- Set up API quotas if needed

## API Quotas

Google Calendar API has default quotas:
- 1,000,000 queries per day
- 1,000 queries per 100 seconds per user

For most use cases, these quotas are sufficient. Monitor usage in Google Cloud Console.

## Support

For issues or questions:
1. Check backend logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test OAuth flow manually using Google OAuth Playground
4. Review Google Calendar API documentation

