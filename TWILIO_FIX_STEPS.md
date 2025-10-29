# Quick Fix for "JWT is invalid" Error

## ✅ Good News!

Your credentials are **correct** - the test script passed! The issue is that your **backend server needs to be restarted** to load the new `.env` values.

## 🔧 Fix Steps

### Step 1: Stop Your Backend Server
1. Go to your terminal where the backend is running
2. Press `Ctrl+C` to stop it

### Step 2: Verify Your .env File

Make sure your `.env` file has these exact values (from your TEST account):

```env
TWILIO_ACCOUNT_SID=ACbf968dfe2dc1838d2431fd1cedd5e493
TWILIO_AUTH_TOKEN=e766fd028088f9055546f80151791de2
TWILIO_API_KEY_SID=SKb23bb088bb47b5d04a14da13d0125575
TWILIO_API_KEY_SECRET=kjdPFfz5... (your full secret)
ENABLE_CALLING=true
```

### Step 3: Restart Backend Server

```bash
cd FIX-BACKEND
npm run dev
```

### Step 4: Test Again

1. Open your frontend
2. Go to a chat room
3. Check the browser console - the error should be gone!

---

## 🔍 Verify Backend is Using Correct Credentials

After restarting, visit this URL in your browser:

```
http://localhost:3001/api/calls/diagnostics
```

You should see:
```json
{
  "success": true,
  "data": {
    "hasAccountSid": true,
    "accountSidPreview": "ACbf968dfe2d...",
    "hasAuthToken": true,
    "hasApiKeySid": true,
    "apiKeySidPreview": "SKb23bb088bb...",
    "hasApiKeySecret": true,
    "apiKeySecretLength": 32,
    "enableCalling": true
  }
}
```

If any values are `false` or `MISSING`, your `.env` file isn't being loaded correctly.

---

## ⚠️ Common Mistakes

### 1. Server Not Restarted
- **Problem:** Updated `.env` but server still running with old values
- **Fix:** Stop server (`Ctrl+C`) and restart (`npm run dev`)

### 2. Wrong .env File Location
- **Problem:** `.env` file in wrong directory
- **Fix:** Make sure `.env` is in `FIX-BACKEND/` (same folder as `package.json`)

### 3. Extra Spaces in .env
- **Problem:** Spaces around values like `TWILIO_ACCOUNT_SID = AC...`
- **Fix:** Remove spaces: `TWILIO_ACCOUNT_SID=AC...`

### 4. Missing Quotes
- **Problem:** Values have quotes: `TWILIO_ACCOUNT_SID="AC..."`
- **Fix:** Remove quotes: `TWILIO_ACCOUNT_SID=AC...`

---

## ✅ After Fix Confirmation

Once it works, you should see in the browser console:
- `✅ Twilio SDK loaded`
- `✅ Microphone permission granted`
- `✅ Received token, identity: ...`
- `✅ Token preview: eyJhbGci...`
- **NO errors about JWT being invalid**

---

## 📝 For Render Deployment

When deploying to Render, remember:
1. Use the **same TEST credentials** you verified locally
2. Add all environment variables in Render dashboard
3. Deploy and test
4. No need to restart - Render restarts automatically

