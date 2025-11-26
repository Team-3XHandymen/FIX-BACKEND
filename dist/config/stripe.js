"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatAmountFromStripe = exports.formatAmountForStripe = exports.isValidStripeAccountId = exports.calculateApplicationFee = exports.STRIPE_CONFIG = exports.stripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
const env_1 = require("./env");
exports.stripe = new stripe_1.default(env_1.config.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
});
exports.STRIPE_CONFIG = {
    APPLICATION_FEE_PERCENTAGE: 0.20,
    CURRENCY: 'usd',
    TEST_MODE: process.env.NODE_ENV === 'development',
    ONBOARDING_RETURN_URL: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/handyman/onboarding/success`,
    ONBOARDING_REFRESH_URL: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/handyman/onboarding/refresh`,
    PAYMENT_SUCCESS_URL: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/client/payment/success`,
    PAYMENT_CANCEL_URL: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/client/payment/cancel`,
};
const calculateApplicationFee = (amountCents) => {
    return Math.round(amountCents * exports.STRIPE_CONFIG.APPLICATION_FEE_PERCENTAGE);
};
exports.calculateApplicationFee = calculateApplicationFee;
const isValidStripeAccountId = (accountId) => {
    return /^acct_[a-zA-Z0-9]+$/.test(accountId);
};
exports.isValidStripeAccountId = isValidStripeAccountId;
const formatAmountForStripe = (amount) => {
    return Math.round(amount * 100);
};
exports.formatAmountForStripe = formatAmountForStripe;
const formatAmountFromStripe = (amountCents) => {
    return amountCents / 100;
};
exports.formatAmountFromStripe = formatAmountFromStripe;
//# sourceMappingURL=stripe.js.map