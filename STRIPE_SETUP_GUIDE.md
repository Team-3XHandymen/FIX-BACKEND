# Stripe Integration Setup Guide

This guide will walk you through setting up Stripe Connect for your handyman marketplace application.

## Prerequisites

1. **Stripe Account**: You need a Stripe account with Connect enabled
2. **Environment Variables**: Your `.env` file should contain the following Stripe keys

## Environment Variables Setup

Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key (test mode)
STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key (test mode)
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook endpoint secret
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_... # Connect webhook secret (optional)

# Frontend URL for redirects
FRONTEND_URL=http://localhost:5173 # Your frontend URL
```

## Step-by-Step Stripe Dashboard Setup

### 1. Create Stripe Account & Get Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Make sure you're in **Test mode** (toggle in top-left)
3. Go to **Developers** → **API Keys**
4. Copy your **Publishable key** and **Secret key** to your `.env` file

### 2. Enable Stripe Connect

1. In Stripe Dashboard, go to **Connect** → **Settings**
2. Enable **Express accounts** (recommended for handyman marketplace)
3. Configure your platform settings:
   - **Platform name**: "Your Handyman Platform"
   - **Platform website**: Your website URL
   - **Support email**: Your support email

### 3. Set Up Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL to: `http://localhost:3001/api/stripe/webhook` (for local testing)
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
   - `payout.paid`
   - `charge.dispute.created`
   - `refund.created`
5. Copy the **Signing secret** to your `.env` file as `STRIPE_WEBHOOK_SECRET`

### 4. Configure Connect Webhooks (Optional)

1. In **Connect** → **Settings** → **Webhooks**
2. Add endpoint: `http://localhost:3001/api/stripe/webhook`
3. Select Connect-specific events if needed
4. Copy the signing secret to `STRIPE_CONNECT_WEBHOOK_SECRET`

## Testing Setup

### 1. Install Stripe CLI (Recommended for Testing)

```bash
# Install Stripe CLI
# Windows: Download from https://github.com/stripe/stripe-cli/releases
# macOS: brew install stripe/stripe-cli/stripe
# Linux: Download from releases page

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

The CLI will give you a webhook signing secret - use this for testing.

### 2. Test Cards

Use these test card numbers:

- **Successful payment**: `4242 4242 4242 4242`
- **Declined payment**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`
- **Insufficient funds**: `4000 0000 0000 9995`

Expiry: Any future date (e.g., `12/25`)
CVC: Any 3 digits (e.g., `123`)

## API Endpoints

### Provider Account Management

#### Create Provider Account
```http
POST /api/stripe/create-provider-account
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_123"
}
```

#### Get Account Status
```http
GET /api/stripe/provider-account/:userId
Authorization: Bearer <token>
```

### Payment Processing

#### Create Checkout Session
```http
POST /api/stripe/create-checkout-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "booking_123"
}
```

#### Get Payment Details
```http
GET /api/stripe/payment/booking/:bookingId
Authorization: Bearer <token>
```

### Refunds

#### Create Refund
```http
POST /api/stripe/refund/:paymentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50.00,
  "reason": "requested_by_customer"
}
```

## Frontend Integration Example

### 1. Install Stripe.js

```bash
npm install @stripe/stripe-js
```

### 2. Payment Component

```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_...'); // Your publishable key

const PaymentButton = ({ bookingId, amount }) => {
  const handlePayment = async () => {
    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId })
      });

      const { data } = await response.json();
      
      if (data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <button onClick={handlePayment}>
      Pay ${amount}
    </button>
  );
};
```

### 3. Provider Onboarding

```typescript
const ProviderOnboarding = ({ userId }) => {
  const handleCreateAccount = async () => {
    try {
      const response = await fetch('/api/stripe/create-provider-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      const { data } = await response.json();
      
      if (data.onboardingUrl) {
        // Redirect to Stripe onboarding
        window.location.href = data.onboardingUrl;
      }
    } catch (error) {
      console.error('Account creation failed:', error);
    }
  };

  return (
    <button onClick={handleCreateAccount}>
      Set Up Payments
    </button>
  );
};
```

## Database Models

The integration includes these new models:

### StripeAccount
- Stores provider's Stripe Connect account information
- Tracks onboarding status and capabilities

### Payment
- Records all payment transactions
- Links to bookings and tracks refunds

### Notification
- Sends payment-related notifications to users

## Testing the Complete Flow

1. **Provider Onboarding**:
   - Create a provider account
   - Complete Stripe onboarding flow
   - Verify account status

2. **Payment Flow**:
   - Create a booking
   - Accept the booking (set fee)
   - Create checkout session
   - Complete payment with test card
   - Verify payment succeeded

3. **Webhook Testing**:
   - Use Stripe CLI to forward webhooks
   - Test various webhook events
   - Verify database updates

## Production Considerations

1. **Switch to Live Mode**:
   - Replace test keys with live keys
   - Update webhook endpoints to production URLs
   - Test with real (small) transactions

2. **Compliance**:
   - Ensure PCI compliance
   - Handle disputes and chargebacks
   - Implement proper error handling

3. **Monitoring**:
   - Set up Stripe Dashboard alerts
   - Monitor webhook delivery
   - Track payment success rates

## Troubleshooting

### Common Issues

1. **Webhook Signature Verification Failed**:
   - Check webhook secret in environment variables
   - Ensure raw body parsing for webhook endpoint

2. **Account Not Ready for Payments**:
   - Verify provider completed onboarding
   - Check account requirements in Stripe Dashboard

3. **Payment Failed**:
   - Check test card numbers
   - Verify account has proper capabilities
   - Check application fee calculation

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will show detailed error messages in API responses.

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Connect Guide](https://stripe.com/docs/connect)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)
