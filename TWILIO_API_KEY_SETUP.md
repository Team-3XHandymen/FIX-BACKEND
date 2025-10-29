# 🔑 Twilio API Key Setup - Critical Step

## ⚠️ The Error You're Getting

```
JWT signature validation failed (code 31202)
The authorization with Token failed (code 20151)
```

This **100% means your Twilio API Key credentials are wrong or missing**.

## ✅ Step-by-Step Fix

### Step 1: Get API Key Credentials

1. **Go to Twilio Console:** https://console.twilio.com/
2. **Click on your Account** (top right corner)
3. **Go to:** "API Keys & Tokens" (left sidebar)
4. **Check if you have an API Key:**
   - If you see one: Click on it to see details
   - If you DON'T have one: Click **"Create API Key"**

### Step 2: Create New API Key (If Needed)

1. Click **"Create API Key"** button
2. **Name:** Enter "Voice Calls" or any name
3. Click **"Create"**
4. **IMPORTANT:** Copy these **IMMEDIATELY**:
   - **SID:** Starts with `SK...` (e.g., `SKxxxxxxxxxxxxx`)
   - **Secret:** Long random string (e.g., `a1b2c3d4e5f6g7h8...`)
   - ⚠️ **You can only see the Secret ONCE!** Copy it now!

### Step 3: Update Your .env File

Open `FIX-BACKEND/.env` and add/update:

```env
# Get these from Twilio Console → Account → API Keys & Tokens
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here

# REQUIRED - Create new API Key if needed
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=your_api_key_secret_here

# Optional for browser-to-browser (not required)
TWILIO_PHONE_NUMBER=+1234567890

ENABLE_CALLING=true
```

**Important:**
- No quotes around values
- No spaces before/after `=`
- Copy the SID exactly (starts with `SK`)
- Copy the Secret exactly (long random string)

### Step 4: Test Token Generation

Run this test script:

```bash
cd FIX-BACKEND
npx ts-node src/scripts/testTwilioToken.ts
```

**Expected Output:**
```
✅ TWILIO_ACCOUNT_SID: ACxxxxxxxx...
✅ TWILIO_API_KEY_SID: SKxxxxxxxx...
✅ TWILIO_API_KEY_SECRET: xxxxxxxx... (length: 32)
✅ SUCCESS! Token generated successfully
```

**If you get an error:**
- Check `.env` file has all 4 variables
- Verify no quotes around values
- Make sure API Key SID starts with `SK`
- Make sure Secret is the long random string (not the SID)

### Step 5: Restart Backend

After updating `.env`:
```bash
cd FIX-BACKEND
npm run dev
```

Watch the console for:
- ✅ `Token generated successfully for identity: ...`
- ❌ `Twilio configuration missing` → Check .env file
- ❌ `Failed to generate access token` → Check API Key credentials

## 🎯 Quick Verification

Check your backend terminal when token is requested. You should see:
```
🔍 Token generation config: {
  accountSid: 'ACxxxxx...',
  apiKeySid: 'SKxxxxx...',
  apiKeySecretLength: 32
}
✅ Token generated successfully for identity: user_xxx_client
```

If you see `apiKeySecretLength: 0` → Secret is missing!

## ❓ Common Mistakes

### Mistake 1: Using Account SID instead of API Key SID
- ❌ Wrong: `TWILIO_API_KEY_SID=ACxxxxxxxx` (Account SID starts with AC)
- ✅ Correct: `TWILIO_API_KEY_SID=SKxxxxxxxx` (API Key SID starts with SK)

### Mistake 2: Using API Key SID as the Secret
- ❌ Wrong: `TWILIO_API_KEY_SECRET=SKxxxxxxxx` (This is the SID, not secret!)
- ✅ Correct: `TWILIO_API_KEY_SECRET=a1b2c3d4e5f6...` (Long random string)

### Mistake 3: Copying the wrong value
- When you create API Key, you see:
  - **SID:** `SKxxxxxxxxxxxxx` ← Use for `TWILIO_API_KEY_SID`
  - **Secret:** `xxxxxxxxxxxxx` (different!) ← Use for `TWILIO_API_KEY_SECRET`

### Mistake 4: Quotes in .env
- ❌ Wrong: `TWILIO_API_KEY_SID="SKxxxxx"`
- ✅ Correct: `TWILIO_API_KEY_SID=SKxxxxx`

## 📝 Backend Logs to Check

When you enter chat room, backend should log:
```
🔍 Token generation config: { accountSid: 'AC...', apiKeySid: 'SK...', apiKeySecretLength: 32 }
✅ Token generated successfully for identity: user_xxx_provider
📞 Generated access token for user: user_xxx_provider
```

If you see:
- `apiKeySecretLength: 0` → Secret not set
- `apiKeySid: 'MISSING'` → SID not set
- Error about JWT → Credentials wrong

## ✅ Success Indicators

Once fixed, you should see:
1. ✅ Backend logs show token generated successfully
2. ✅ Frontend shows "✅ Received token, identity: ..."
3. ✅ "📞 Twilio device ready" in browser console
4. ✅ No JWT signature errors
5. ✅ Call button works

## 🔄 Still Having Issues?

1. **Delete old API Key** and create a new one
2. **Double-check** you copied the Secret (not the SID)
3. **Restart backend** after updating .env
4. **Check backend logs** for token generation errors
5. **Verify** all 4 credentials are in .env file

