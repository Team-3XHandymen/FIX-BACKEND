import Stripe from 'stripe';
import { config } from './env';

// Initialize Stripe with your secret key
export const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil', // Use the latest stable API version
});

// Stripe configuration constants
export const STRIPE_CONFIG = {
  // Application fee percentage (platform takes 20%)
  APPLICATION_FEE_PERCENTAGE: 0.20,
  
  // Currency for payments
  CURRENCY: 'usd',
  
  // Test mode configuration
  TEST_MODE: process.env.NODE_ENV === 'development',
  
  // Redirect URLs for Connect onboarding
  ONBOARDING_RETURN_URL: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/handyman/onboarding/success`,
  ONBOARDING_REFRESH_URL: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/handyman/onboarding/refresh`,
  
  // Payment success/cancel URLs
  PAYMENT_SUCCESS_URL: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/client/payment/success`,
  PAYMENT_CANCEL_URL: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/client/payment/cancel`,
} as const;

// Helper function to calculate application fee
export const calculateApplicationFee = (amountCents: number): number => {
  return Math.round(amountCents * STRIPE_CONFIG.APPLICATION_FEE_PERCENTAGE);
};

// Helper function to validate Stripe account ID format
export const isValidStripeAccountId = (accountId: string): boolean => {
  return /^acct_[a-zA-Z0-9]+$/.test(accountId);
};

// Helper function to format amount for Stripe (convert dollars to cents)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

// Helper function to format amount from Stripe (convert cents to dollars)
export const formatAmountFromStripe = (amountCents: number): number => {
  return amountCents / 100;
};
