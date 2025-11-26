# Fix: Google OAuth redirect_uri_mismatch Error

## Problem
Getting `Error 400: redirect_uri_mismatch` when trying to connect Google Calendar.

**Error shows:**
- Current redirect URI: `https://fixfinder-backend-zrn7.onrender.com/api/google-calendar/callback`
- Should be: `https://fixfinder-backend-zrn7.onrender.com/api/google-calendar/oauth/callback`

## Solution

### Step 1: Update Environment Variable on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your backend service (`fixfinder-backend-zrn7`)
3. Click on **"Environment"** tab
4. Find `GOOGLE_REDIRECT_URI` variable
5. **Update it to:**
   ```
   https://fixfinder-backend-zrn7.onrender.com/api/google-calendar/oauth/callback
   ```
   ⚠️ **Important:** Make sure it includes `/oauth` in the path!
6. Click **"Save Changes"**
7. Render will automatically redeploy

### Step 2: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your OAuth 2.0 Client ID
4. Click **Edit** (pencil icon)
5. Under **Authorized redirect URIs**, check if you have:
   - ❌ `https://fixfinder-backend-zrn7.onrender.com/api/google-calendar/callback` (WRONG)
   - ✅ `https://fixfinder-backend-zrn7.onrender.com/api/google-calendar/oauth/callback` (CORRECT)
6. If the wrong one exists, **delete it**
7. **Add the correct one:**
   ```
   https://fixfinder-backend-zrn7.onrender.com/api/google-calendar/oauth/callback
   ```
8. Click **Save**

### Step 3: Verify Both Match Exactly

The redirect URI must match **exactly** in both places:

✅ **Render Environment Variable:**
```
GOOGLE_REDIRECT_URI=https://fixfinder-backend-zrn7.onrender.com/api/google-calendar/oauth/callback
```

✅ **Google Cloud Console:**
```
https://fixfinder-backend-zrn7.onrender.com/api/google-calendar/oauth/callback
```

### Step 4: Test Again

1. Wait for Render deployment to complete
2. Go to your frontend: https://fix-frontend.netlify.app/handyman/settings
3. Click **"Connect Google Calendar"**
4. Should now work without the redirect_uri_mismatch error

## Common Mistakes

❌ **Wrong:**
```
GOOGLE_REDIRECT_URI=https://fixfinder-backend-zrn7.onrender.com/api/google-calendar/callback
```

✅ **Correct:**
```
GOOGLE_REDIRECT_URI=https://fixfinder-backend-zrn7.onrender.com/api/google-calendar/oauth/callback
```

The difference is `/oauth` in the path!

## Why This Happened

The route structure is:
- Base: `/api/google-calendar`
- Route: `/oauth/callback`
- Full path: `/api/google-calendar/oauth/callback`

If you only set `/callback`, it doesn't match the actual route path.

## Verification Checklist

- [ ] Render `GOOGLE_REDIRECT_URI` includes `/oauth/callback`
- [ ] Google Cloud Console redirect URI includes `/oauth/callback`
- [ ] Both URIs match exactly (including https://)
- [ ] Render deployment completed
- [ ] Test OAuth flow works

