# Fixing "JWT is invalid" Error (Code 31204)

## The Problem

The error `JWT is invalid (code: 31204)` means your **API Key credentials don't match your Account SID**.

## Most Common Causes

### 1. **TEST/LIVE Account Mismatch** ⚠️ (Most Common)

**Problem:** You created an API Key in your **TEST account** but you're using credentials from your **LIVE account** (or vice versa).

**Example:**
```
❌ WRONG:
TWILIO_ACCOUNT_SID=AC... (from TEST account)
TWILIO_AUTH_TOKEN=... (from TEST account)
TWILIO_API_KEY_SID=SK... (from LIVE account) ← MISMATCH!
TWILIO_API_KEY_SECRET=... (from LIVE account) ← MISMATCH!
```

**✅ CORRECT:**
All credentials must be from the **same** account (all TEST or all LIVE):
```
TWILIO_ACCOUNT_SID=AC... (TEST)
TWILIO_AUTH_TOKEN=... (TEST)
TWILIO_API_KEY_SID=SK... (TEST)
TWILIO_API_KEY_SECRET=... (TEST)
```

### 2. **Wrong API Key Secret**

**Problem:** You copied the API Key **SID** instead of the **Secret**.

**How to identify:**
- API Key SID starts with `SK...` (you use this in `TWILIO_API_KEY_SID`)
- API Key Secret is a **long random string** (you use this in `TWILIO_API_KEY_SECRET`)
- The Secret is shown **ONCE** when you create the API Key - if you lost it, create a new one

### 3. **API Key Deleted or Expired**

- If you deleted the API Key, tokens won't work
- API Keys don't expire, but they can be revoked

---

## Step-by-Step Fix

### Step 1: Verify Which Account You're Using

1. Go to **Twilio Console** → Top right → See which account is selected
   - Blue badge = **LIVE**
   - Orange badge = **TEST**

2. Check your `.env` file:
   ```bash
   # Your Account SID tells you which account
   TWILIO_ACCOUNT_SID=AC... 
   ```
   - Test Account SID starts with `AC...` (usually longer)
   - Live Account SID starts with `AC...` (look the same, but different account)

### Step 2: Create API Key in the CORRECT Account

1. **Switch to the account** that matches your `TWILIO_ACCOUNT_SID`
   - If your SID is from TEST → use TEST account
   - If your SID is from LIVE → use LIVE account

2. **Create API Key:**
   - Console → Account → API Keys & Tokens
   - Click "Create API Key"
   - Name it (e.g., "Voice Calls")
   - **IMMEDIATELY COPY:**
     - SID (starts with `SK...`)
     - Secret (long random string)

3. **Update `.env` file:**
   ```env
   TWILIO_ACCOUNT_SID=AC... (same account)
   TWILIO_AUTH_TOKEN=... (same account)
   TWILIO_API_KEY_SID=SK... (from step 2)
   TWILIO_API_KEY_SECRET=... (from step 2)
   ```

### Step 3: Test Locally

Run the test script:
```bash
cd FIX-BACKEND
npx ts-node src/scripts/testTwilioToken.ts
```

If it works, you should see:
```
✅ SUCCESS! Token generated successfully
✅ Token generation test PASSED!
```

### Step 4: Restart Your Backend

After updating `.env`, **restart your backend server**:
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

---

## Quick Verification Checklist

Run this command to check your credentials:
```bash
cd FIX-BACKEND
node -e "require('dotenv').config({ path: '.env' }); console.log('Account SID:', process.env.TWILIO_ACCOUNT_SID ? process.env.TWILIO_ACCOUNT_SID.substring(0, 12) + '...' : 'MISSING'); console.log('API Key SID:', process.env.TWILIO_API_KEY_SID ? process.env.TWILIO_API_KEY_SID.substring(0, 12) + '...' : 'MISSING'); console.log('API Key Secret:', process.env.TWILIO_API_KEY_SECRET ? 'SET (length: ' + process.env.TWILIO_API_KEY_SECRET.length + ')' : 'MISSING');"
```

Expected output:
- Account SID: Should show first 12 chars
- API Key SID: Should show first 12 chars (starts with `SK`)
- API Key Secret: Should show length (usually 32+ characters)

---

## Still Not Working?

### Double-check in Twilio Console:

1. **Verify API Key exists:**
   - Console → Account → API Keys & Tokens
   - Find your API Key
   - Check the SID matches your `.env` file

2. **Check Account SID:**
   - Console → Account → General Settings
   - Compare with `TWILIO_ACCOUNT_SID` in `.env`

3. **Re-create API Key (if unsure):**
   - Delete the old one
   - Create a new one
   - Copy BOTH SID and Secret immediately
   - Update `.env` and restart

---

## Remember

✅ **All 4 credentials must be from the SAME account:**
- `TWILIO_ACCOUNT_SID` (Account identifier)
- `TWILIO_AUTH_TOKEN` (Account auth token)
- `TWILIO_API_KEY_SID` (API Key identifier)
- `TWILIO_API_KEY_SECRET` (API Key secret)

❌ **Phone number is NOT needed** for browser-to-browser calling

✅ **Test vs Live doesn't matter** - just make sure they all match!

