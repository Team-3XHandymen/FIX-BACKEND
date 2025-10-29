# Quick Twilio Test Guide

## 🧪 Testing Checklist

### Prerequisites Check
- [ ] Twilio account created
- [ ] Environment variables set in `.env`
- [ ] Backend dependencies installed: `npm install twilio`
- [ ] Backend running on port 3001
- [ ] Frontend running

### Step-by-Step Test

1. **Verify Backend Setup:**
   ```bash
   cd FIX-BACKEND
   npm install twilio
   npm run dev
   ```
   Check console for no errors.

2. **Test Access Token Endpoint:**
   ```bash
   curl -X GET "http://localhost:3001/api/calls/token?userType=client" \
     -H "X-User-ID: test-user-id" \
     -H "X-User-Type: client"
   ```
   Should return: `{ "success": true, "data": { "token": "...", "identity": "..." } }`

3. **Test in Browser:**
   - Open chat room
   - Check browser console for "Twilio SDK loaded"
   - Click "Call" button
   - Check for errors in console

4. **Test Call Flow:**
   - Open two browser tabs (client & handyman)
   - Both should see "Call" button
   - Click call from one side
   - Other side should receive call
   - Test audio works

## 🐛 Common Issues

### "Failed to get access token"
**Solution:** Check `.env` file has correct Twilio credentials

### "Twilio SDK not loaded"
**Solution:** 
- Check internet connection
- Open browser DevTools → Network tab
- Verify `twilio.min.js` loads successfully

### "Call connects but no audio"
**Solution:**
- Check browser microphone permissions
- Verify both users have granted microphone access
- Check browser console for WebRTC errors

### Backend shows errors
**Solution:**
- Check all environment variables are set
- Verify Twilio credentials are correct
- Check MongoDB connection is working

## ✅ Success Indicators

- ✅ Access token endpoint returns token
- ✅ Twilio SDK loads in browser
- ✅ Call button appears in chat
- ✅ Can initiate call
- ✅ Other party receives call
- ✅ Audio works both ways
- ✅ Call history is saved

