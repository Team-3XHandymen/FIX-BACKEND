# Render Deployment Guide for FIX Backend

This guide provides step-by-step instructions for deploying the FIX backend on Render.

## Prerequisites

1. **GitHub Repository**: Your backend code should be pushed to a GitHub repository
2. **Render Account**: Create a free account at [render.com](https://render.com)
3. **MongoDB Atlas**: Set up a MongoDB Atlas cluster for production database
4. **Environment Variables**: Have all your environment variable values ready

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

```bash
# Navigate to your backend directory
cd FIX-BACKEND

# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Prepare backend for Render deployment"

# Add your GitHub repository as remote
git remote add origin <your-github-repo-url>

# Push to GitHub
git push -u origin main
```

### 2. Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** button in the top right
3. Select **"Web Service"**
4. Connect your GitHub repository:
   - Click **"Connect account"** if you haven't connected GitHub
   - Search for your backend repository
   - Click **"Connect"**

### 3. Configure Your Web Service

Fill in the following details:

| Field | Value |
|-------|-------|
| **Name** | `fix-backend` (or your preferred name) |
| **Region** | Choose closest to your users (e.g., Oregon - US West) |
| **Branch** | `main` |
| **Root Directory** | Leave empty or put `FIX-BACKEND` if deploying from monorepo |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` (or choose paid plan for better performance) |

### 4. Set Environment Variables

Click on **"Advanced"** and add the following environment variables:

#### Required Environment Variables:

```env
# MongoDB
MONGODB_URI=<your-mongodb-atlas-connection-string>

# Server
NODE_ENV=development
PORT=3001

# Frontend URL (will be updated after frontend deployment)
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# Clerk Authentication
CLERK_SECRET_KEY=<your-clerk-secret-key>
CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>

# Stripe (for payments)
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
STRIPE_CONNECT_WEBHOOK_SECRET=<your-stripe-connect-webhook-secret>

# Email (if using email features)
SMTP_HOST=<your-smtp-host>
SMTP_PORT=587
SMTP_USER=<your-smtp-user>
SMTP_PASS=<your-smtp-password>

# Optional
LOG_LEVEL=info
ENABLE_CHAT=true
ENABLE_NOTIFICATIONS=true
ENABLE_PAYMENTS=true
```

### 5. Deploy Your Service

1. Click **"Create Web Service"** at the bottom
2. Render will start building and deploying your application
3. Wait for the build to complete (usually 2-5 minutes)
4. Once deployed, you'll see a URL like: `https://fix-backend-xxxx.onrender.com`

### 6. Verify Deployment

Test your deployment by visiting these endpoints:

1. **Health Check**: `https://your-backend-url.onrender.com/health`
   - Should return: `{"success": true, "message": "Server is running"}`

2. **Root Endpoint**: `https://your-backend-url.onrender.com/`
   - Should return: `{"success": true, "message": "Handyman App API"}`

3. **Services**: `https://your-backend-url.onrender.com/api/services`
   - Should return list of services

### 7. Update Frontend URL After Frontend Deployment

After deploying your frontend:

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Update `FRONTEND_URL` to your deployed frontend URL
5. Click **"Save Changes"**
6. Service will automatically redeploy

### 8. Configure Stripe Webhooks

After deployment, update your Stripe webhook endpoint:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **Webhooks**
3. Update or create webhook endpoint with your Render URL:
   - URL: `https://your-backend-url.onrender.com/api/stripe/webhook`
4. Copy the new webhook signing secret
5. Update `STRIPE_WEBHOOK_SECRET` in Render environment variables

## MongoDB Atlas Setup (if not done)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with password
4. Add network access: `0.0.0.0/0` (allow from anywhere)
5. Get connection string from **Connect** → **Connect your application**
6. Replace `<password>` with your database user password
7. Use this connection string for `MONGODB_URI`

## Troubleshooting

### Build Fails

**Check logs in Render dashboard for specific errors:**

- **Missing dependencies**: Make sure `package.json` includes all dependencies
- **TypeScript errors**: Fix any TypeScript compilation errors locally first
- **Wrong Node version**: Render uses Node 14+ by default

### Application Crashes

**Common issues:**

1. **MongoDB connection**: Verify `MONGODB_URI` is correct and MongoDB Atlas allows connections
2. **Missing environment variables**: Check all required env vars are set
3. **Port issues**: Don't hardcode port, use `process.env.PORT`

### CORS Issues

1. Verify `FRONTEND_URL` is set correctly
2. Make sure frontend URL doesn't have trailing slash
3. Check CORS middleware configuration in `index.ts`

### Free Tier Limitations

Render's free tier:
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-50 seconds
- 750 hours/month of runtime
- Consider upgrading to paid tier for production

## Monitoring

### View Logs

1. Go to Render dashboard
2. Select your service
3. Click **"Logs"** tab
4. View real-time logs

### Metrics

1. Click **"Metrics"** tab
2. Monitor CPU, Memory, and Bandwidth usage

## Updating Your Deployment

Render automatically redeploys when you push to your connected branch:

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push origin main
```

Render will detect the push and automatically redeploy.

## Manual Redeployment

1. Go to Render dashboard
2. Select your service
3. Click **"Manual Deploy"** dropdown
4. Select **"Deploy latest commit"**

## Custom Domain (Optional)

1. Go to your service settings
2. Click **"Custom Domains"**
3. Add your custom domain
4. Update DNS records as instructed by Render

## Environment-Specific Configurations

For different environments:

- **Development**: Local environment with `.env` file
- **Staging**: Separate Render service with staging database
- **Production**: Production Render service with production database

## Security Best Practices

1. ✅ Never commit `.env` file
2. ✅ Use strong passwords for MongoDB
3. ✅ Rotate API keys regularly
4. ✅ Enable MongoDB authentication
5. ✅ Use HTTPS only (Render provides this automatically)
6. ✅ Set appropriate CORS origins
7. ✅ Keep dependencies updated

## Cost Optimization

- Free tier is sufficient for development and testing
- For production with consistent traffic, upgrade to at least **Starter** tier ($7/month)
- Monitor usage to avoid unexpected charges

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [Render Status](https://status.render.com/)

## Next Steps

After successful backend deployment:

1. ✅ Deploy frontend
2. ✅ Update `FRONTEND_URL` in backend environment variables
3. ✅ Update API URL in frontend environment variables
4. ✅ Configure Stripe webhooks with production URL
5. ✅ Test complete application flow
6. ✅ Set up monitoring and alerts

---

**Deployment Checklist:**

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] MongoDB Atlas cluster set up
- [ ] Web service created on Render
- [ ] All environment variables configured
- [ ] Build successful
- [ ] Health check endpoint working
- [ ] CORS configured correctly
- [ ] Stripe webhooks updated
- [ ] Frontend URL updated after frontend deployment

Good luck with your deployment! 🚀

