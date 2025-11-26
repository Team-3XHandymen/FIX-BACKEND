"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeController = void 0;
const stripe_1 = require("../config/stripe");
const StripeAccount_1 = require("../models/StripeAccount");
const Payment_1 = require("../models/Payment");
const Booking_1 = require("../models/Booking");
const ServiceProvider_1 = require("../models/ServiceProvider");
const Client_1 = require("../models/Client");
class StripeController {
    static async createProviderAccount(req, res) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        try {
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required',
                });
            }
            const existingAccount = await StripeAccount_1.StripeAccount.findOne({ userId });
            if (existingAccount) {
                return res.status(409).json({
                    success: false,
                    message: 'User already has a Stripe account',
                    data: {
                        accountId: existingAccount.accountId,
                        onboardingUrl: existingAccount.requirements.currentlyDue.length > 0
                            ? await StripeController.createOnboardingLink(existingAccount.accountId)
                            : null,
                    },
                });
            }
            const account = await stripe_1.stripe.accounts.create({
                type: 'express',
                country: 'US',
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                business_type: 'individual',
            });
            const stripeAccount = new StripeAccount_1.StripeAccount({
                userId,
                accountId: account.id,
                accountType: 'express',
                country: 'US',
                chargesEnabled: account.charges_enabled,
                payoutsEnabled: account.payouts_enabled,
                detailsSubmitted: account.details_submitted,
                requirements: {
                    currentlyDue: ((_a = account.requirements) === null || _a === void 0 ? void 0 : _a.currently_due) || [],
                    eventuallyDue: ((_b = account.requirements) === null || _b === void 0 ? void 0 : _b.eventually_due) || [],
                    pastDue: ((_c = account.requirements) === null || _c === void 0 ? void 0 : _c.past_due) || [],
                    pendingVerification: ((_d = account.requirements) === null || _d === void 0 ? void 0 : _d.pending_verification) || [],
                    disabledReason: (_e = account.requirements) === null || _e === void 0 ? void 0 : _e.disabled_reason,
                },
                capabilities: {
                    cardPayments: ((_f = account.capabilities) === null || _f === void 0 ? void 0 : _f.card_payments) === 'active',
                    transfers: ((_g = account.capabilities) === null || _g === void 0 ? void 0 : _g.transfers) === 'active',
                },
                businessProfile: {
                    name: (_h = account.business_profile) === null || _h === void 0 ? void 0 : _h.name,
                    url: (_j = account.business_profile) === null || _j === void 0 ? void 0 : _j.url,
                    supportEmail: (_k = account.business_profile) === null || _k === void 0 ? void 0 : _k.support_email,
                    supportPhone: (_l = account.business_profile) === null || _l === void 0 ? void 0 : _l.support_phone,
                },
            });
            await stripeAccount.save();
            const onboardingUrl = await StripeController.createOnboardingLink(account.id);
            res.status(201).json({
                success: true,
                message: 'Stripe account created successfully',
                data: {
                    accountId: account.id,
                    onboardingUrl,
                },
            });
        }
        catch (error) {
            console.error('Error creating Stripe account:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create Stripe account',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            });
        }
    }
    static async createOnboardingLink(accountId) {
        const accountLink = await stripe_1.stripe.accountLinks.create({
            account: accountId,
            refresh_url: stripe_1.STRIPE_CONFIG.ONBOARDING_REFRESH_URL,
            return_url: stripe_1.STRIPE_CONFIG.ONBOARDING_RETURN_URL,
            type: 'account_onboarding',
        });
        return accountLink.url;
    }
    static async getProviderAccountStatus(req, res) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        try {
            const { userId } = req.params;
            const stripeAccount = await StripeAccount_1.StripeAccount.findOne({ userId });
            if (!stripeAccount) {
                return res.status(404).json({
                    success: false,
                    message: 'Stripe account not found',
                });
            }
            const account = await stripe_1.stripe.accounts.retrieve(stripeAccount.accountId);
            console.log('🔍 Stripe Account Debug Info:', {
                accountId: account.id,
                chargesEnabled: account.charges_enabled,
                payoutsEnabled: account.payouts_enabled,
                detailsSubmitted: account.details_submitted,
                requirements: account.requirements,
                capabilities: account.capabilities,
                businessProfile: account.business_profile,
                country: account.country,
                type: account.type,
                created: account.created,
            });
            if (account.requirements) {
                console.log('📋 Requirements Details:', {
                    currentlyDue: account.requirements.currently_due,
                    eventuallyDue: account.requirements.eventually_due,
                    pastDue: account.requirements.past_due,
                    pendingVerification: account.requirements.pending_verification,
                    disabledReason: account.requirements.disabled_reason,
                    currentDeadline: account.requirements.current_deadline,
                });
            }
            await StripeAccount_1.StripeAccount.findByIdAndUpdate(stripeAccount._id, {
                chargesEnabled: account.charges_enabled,
                payoutsEnabled: account.payouts_enabled,
                detailsSubmitted: account.details_submitted,
                requirements: {
                    currentlyDue: ((_a = account.requirements) === null || _a === void 0 ? void 0 : _a.currently_due) || [],
                    eventuallyDue: ((_b = account.requirements) === null || _b === void 0 ? void 0 : _b.eventually_due) || [],
                    pastDue: ((_c = account.requirements) === null || _c === void 0 ? void 0 : _c.past_due) || [],
                    pendingVerification: ((_d = account.requirements) === null || _d === void 0 ? void 0 : _d.pending_verification) || [],
                    disabledReason: (_e = account.requirements) === null || _e === void 0 ? void 0 : _e.disabled_reason,
                },
                capabilities: {
                    cardPayments: ((_f = account.capabilities) === null || _f === void 0 ? void 0 : _f.card_payments) === 'active',
                    transfers: ((_g = account.capabilities) === null || _g === void 0 ? void 0 : _g.transfers) === 'active',
                },
            });
            const needsOnboarding = ((_h = account.requirements) === null || _h === void 0 ? void 0 : _h.currently_due) && account.requirements.currently_due.length > 0;
            const onboardingUrl = needsOnboarding ? await StripeController.createOnboardingLink(account.id) : null;
            res.json({
                success: true,
                data: {
                    accountId: account.id,
                    chargesEnabled: account.charges_enabled,
                    payoutsEnabled: account.payouts_enabled,
                    detailsSubmitted: account.details_submitted,
                    needsOnboarding,
                    onboardingUrl,
                    requirements: account.requirements,
                },
            });
        }
        catch (error) {
            console.error('Error getting account status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get account status',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            });
        }
    }
    static async createCheckoutSession(req, res) {
        var _a;
        try {
            const { bookingId } = req.body;
            const clientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!bookingId || !clientId) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID and client authentication required',
                });
            }
            const booking = await Booking_1.Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found',
                });
            }
            if (booking.clientId !== clientId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
            }
            if (booking.status !== 'accepted') {
                return res.status(400).json({
                    success: false,
                    message: 'Booking must be accepted before payment',
                });
            }
            if (!booking.fee || booking.fee <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking fee not set',
                });
            }
            const providerStripeAccount = await StripeAccount_1.StripeAccount.findOne({ userId: booking.providerId });
            if (!providerStripeAccount) {
                return res.status(400).json({
                    success: false,
                    message: 'Provider has not set up payment account',
                });
            }
            if (!providerStripeAccount.chargesEnabled) {
                return res.status(400).json({
                    success: false,
                    message: 'Provider payment account is not ready',
                });
            }
            const client = await Client_1.Client.findOne({ userId: booking.clientId });
            const provider = await ServiceProvider_1.ServiceProvider.findOne({ userId: booking.providerId });
            const totalAmount = booking.fee * 1.2;
            const amountCents = (0, stripe_1.formatAmountForStripe)(totalAmount);
            const transferAmountCents = Math.round(booking.fee * 100);
            const session = await stripe_1.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: stripe_1.STRIPE_CONFIG.CURRENCY,
                            product_data: {
                                name: `${booking.serviceName} - ${booking.providerName}`,
                                description: booking.description,
                            },
                            unit_amount: amountCents,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                payment_intent_data: {
                    transfer_data: {
                        destination: providerStripeAccount.accountId,
                        amount: transferAmountCents,
                    },
                    metadata: {
                        bookingId: bookingId,
                        clientId: booking.clientId,
                        providerId: booking.providerId,
                        serviceName: booking.serviceName,
                        providerName: booking.providerName,
                        clientName: (client === null || client === void 0 ? void 0 : client.name) || 'Client',
                    },
                },
                success_url: `${stripe_1.STRIPE_CONFIG.PAYMENT_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
                cancel_url: `${stripe_1.STRIPE_CONFIG.PAYMENT_CANCEL_URL}?booking_id=${bookingId}`,
                metadata: {
                    bookingId: bookingId,
                    clientId: booking.clientId,
                    providerId: booking.providerId,
                },
            });
            res.json({
                success: true,
                message: 'Checkout session created successfully',
                data: {
                    sessionId: session.id,
                    checkoutUrl: session.url,
                },
            });
        }
        catch (error) {
            console.error('Error creating checkout session:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create checkout session',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            });
        }
    }
    static async getPaymentByBookingId(req, res) {
        var _a;
        try {
            const { bookingId } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
            }
            const payment = await Payment_1.Payment.findOne({ bookingId });
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found',
                });
            }
            if (payment.clientId !== userId && payment.providerId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
            }
            res.json({
                success: true,
                data: payment,
            });
        }
        catch (error) {
            console.error('Error getting payment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payment details',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            });
        }
    }
    static async getPaymentsByProvider(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
            }
            const payments = await Payment_1.Payment.find({ providerId: userId })
                .sort({ createdAt: -1 })
                .limit(50);
            const totalEarnings = payments
                .filter(p => p.status === 'succeeded')
                .reduce((sum, p) => sum + ((p.amountCents / 100) - (p.applicationFeeCents / 100)), 0);
            res.json({
                success: true,
                data: {
                    payments,
                    summary: {
                        totalEarnings,
                        pendingAmount: totalEarnings,
                        transactionCount: payments.length,
                    },
                },
            });
        }
        catch (error) {
            console.error('Error getting provider payments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payment details',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            });
        }
    }
    static async createRefund(req, res) {
        var _a, _b;
        try {
            const { paymentId } = req.params;
            const { amount, reason } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
            }
            const payment = await Payment_1.Payment.findOne({ paymentIntentId: paymentId });
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found',
                });
            }
            if (payment.providerId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
            }
            const refundAmount = amount ? (0, stripe_1.formatAmountForStripe)(amount) : undefined;
            const refund = await stripe_1.stripe.refunds.create({
                payment_intent: payment.paymentIntentId,
                amount: refundAmount,
                reason: reason || 'requested_by_customer',
            });
            (_b = payment.refunds) === null || _b === void 0 ? void 0 : _b.push({
                refundId: refund.id,
                amountCents: refund.amount,
                reason: refund.reason || reason,
                createdAt: new Date(),
            });
            if (refund.status === 'succeeded') {
                payment.status = 'refunded';
            }
            await payment.save();
            res.json({
                success: true,
                message: 'Refund created successfully',
                data: {
                    refundId: refund.id,
                    amount: refund.amount,
                    status: refund.status,
                },
            });
        }
        catch (error) {
            console.error('Error creating refund:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create refund',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            });
        }
    }
    static async createManualPayment(req, res) {
        var _a, _b, _c;
        try {
            const { bookingId, sessionId } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
            }
            if (!bookingId || !sessionId) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID and Session ID are required',
                });
            }
            const session = await stripe_1.stripe.checkout.sessions.retrieve(sessionId);
            if (!session.payment_intent) {
                return res.status(400).json({
                    success: false,
                    message: 'No payment intent found in session',
                });
            }
            const paymentIntent = await stripe_1.stripe.paymentIntents.retrieve(session.payment_intent);
            const booking = await Booking_1.Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found',
                });
            }
            const transferAmount = ((_b = paymentIntent.transfer_data) === null || _b === void 0 ? void 0 : _b.amount) || 0;
            const applicationFeeCents = paymentIntent.amount - transferAmount;
            const payment = new Payment_1.Payment({
                bookingId,
                paymentIntentId: paymentIntent.id,
                sessionId: session.id,
                amountCents: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: 'succeeded',
                applicationFeeCents: applicationFeeCents,
                providerAccountId: ((_c = paymentIntent.transfer_data) === null || _c === void 0 ? void 0 : _c.destination) || '',
                clientId: booking.clientId,
                providerId: booking.providerId,
                metadata: {
                    bookingId,
                    serviceName: booking.serviceName,
                    providerName: booking.providerName,
                },
            });
            await payment.save();
            await Booking_1.Booking.findByIdAndUpdate(bookingId, { status: 'paid' });
            console.log('✅ Manual payment record created for booking:', bookingId);
            res.json({
                success: true,
                message: 'Payment record created successfully',
                data: payment,
            });
        }
        catch (error) {
            console.error('Error creating manual payment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create payment record',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            });
        }
    }
}
exports.StripeController = StripeController;
//# sourceMappingURL=stripeController.js.map