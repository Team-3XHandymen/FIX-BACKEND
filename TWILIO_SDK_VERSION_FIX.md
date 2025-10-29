# Fixing "Client version not supported" Error (Code 31007)

## The Problem

The error `Client version not supported (code: 31007)` means you're using an **outdated Twilio Client SDK version**. 

**Twilio deprecated version 1.x on September 10, 2025**, so you must use version 2.x or later.

## ✅ Solution

The code has been updated to use the latest SDK version automatically. If you're still seeing the error:

### Option 1: Clear Browser Cache (Recommended)

1. **Hard refresh** your browser:
   - Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Firefox: `Ctrl+F5` or `Cmd+Shift+R`

2. **Or clear cache:**
   - Chrome: DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

### Option 2: Check SDK Version in Code

Make sure `CallButton.tsx` is loading the latest SDK:

```typescript
// Should be:
script.src = 'https://sdk.twilio.com/js/client/latest/twilio.min.js';

// NOT:
script.src = 'https://sdk.twilio.com/js/client/releases/1.14.0/twilio.min.js'; // ❌ Deprecated
```

### Option 3: Use Specific Latest Version

If `latest` doesn't work, try a specific 2.x version:

```typescript
script.src = 'https://sdk.twilio.com/js/client/releases/2.3.2/twilio.min.js';
```

---

## 🔍 Verify It's Fixed

After clearing cache or updating, check browser console:

✅ **Should see:**
- `✅ Twilio SDK loaded`
- No "Client version not supported" error

❌ **If still seeing error:**
- Check Network tab in DevTools
- Look for the `twilio.min.js` request
- Verify it's loading from a URL with version 2.x or `latest`

---

## 📝 For Deployment

When deploying to Netlify:
1. The updated code will automatically use the latest SDK
2. Users may need to clear their browser cache
3. Consider adding a cache-busting query string if issues persist:
   ```typescript
   script.src = 'https://sdk.twilio.com/js/client/latest/twilio.min.js?v=' + Date.now();
   ```

---

## ⚠️ Important Notes

- **Version 1.x SDK is deprecated** and will stop working
- **Always use version 2.x or latest**
- The API remains the same for browser-to-browser calling (`Device`, `connect()`, etc.)
- No code changes needed beyond the SDK URL

---

## 🎯 Summary

1. ✅ Code updated to use latest SDK
2. ✅ Clear browser cache
3. ✅ Test again
4. ✅ Should work!

