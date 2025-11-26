"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeWebhookController = void 0;
const stripe_1 = require("../config/stripe");
const StripeAccount_1 = require("../models/StripeAccount");
const Payment_1 = require("../models/Payment");
const Booking_1 = require("../models/Booking");
const Notification_1 = require("../models/Notification");
class StripeWebhookController {
    static async handleWebhook(req, res) {
        try {
            const sig = req.headers['stripe-signature'];
            const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
            if (!endpointSecret) {
                console.error('❌ Stripe webhook secret not configured');
                return res.status(500).json({
                    success: false,
                    message: 'Webhook secret not configured',
                });
            }
            let event;
            try {
                event = stripe_1.stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            }
            catch (err) {
                console.error('❌ Webhook signature verification failed:', err.message);
                return res.status(400).json({
                    success: false,
                    message: `Webhook Error: ${err.message}`,
                });
            }
            console.log(`🔔 Received webhook event: ${event.type}`);
            switch (event.type) {
                case 'checkout.session.completed':
                    await this.handleCheckoutSessionCompleted(event.data.object);
                    break;
                case 'payment_intent.succeeded':
                    await this.handlePaymentIntentSucceeded(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentIntentFailed(event.data.object);
                    break;
                case 'account.updated':
                    await this.handleAccountUpdated(event.data.object);
                    break;
                case 'payout.paid':
                    await this.handlePayoutPaid(event.data.object);
                    break;
                case 'charge.dispute.created':
                    await this.handleChargeDisputeCreated(event.data.object);
                    break;
                case 'refund.created':
                    await this.handleRefundCreated(event.data.object);
                    break;
                default:
                    console.log(`⚠️ Unhandled event type: ${event.type}`);
            }
            res.json({ received: true });
        }
        catch (error) {
            console.error('❌ Webhook processing error:', error);
            res.status(500).json({
                success: false,
                message: 'Webhook processing failed',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            });
        }
    }
    static async handleCheckoutSessionCompleted(session) {
        var _a, _b, _c, _d;
        try {
            console.log('✅ Checkout session completed:', session.id);
            const { bookingId, clientId, providerId } = session.metadata;
            if (!bookingId) {
                console.error('❌ No booking ID in session metadata');
                return;
            }
            const paymentIntent = await stripe_1.stripe.paymentIntents.retrieve(session.payment_intent);
            const payment = new Payment_1.Payment({
                bookingId,
                paymentIntentId: paymentIntent.id,
                sessionId: session.id,
                amountCents: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: 'succeeded',
                applicationFeeCents: paymentIntent.application_fee_amount || 0,
                providerAccountId: ((_a = paymentIntent.transfer_data) === null || _a === void 0 ? void 0 : _a.destination) || '',
                clientId,
                providerId,
                metadata: {
                    bookingId,
                    serviceName: (_b = paymentIntent.metadata) === null || _b === void 0 ? void 0 : _b.serviceName,
                    providerName: (_c = paymentIntent.metadata) === null || _c === void 0 ? void 0 : _c.providerName,
                    clientName: (_d = paymentIntent.metadata) === null || _d === void 0 ? void 0 : _d.clientName,
                },
            });
            await payment.save();
            await Booking_1.Booking.findByIdAndUpdate(bookingId, { status: 'paid' });
            await this.createPaymentNotifications(clientId, providerId, bookingId, paymentIntent.amount);
            console.log('✅ Payment record created and booking updated');
        }
        catch (error) {
            console.error('❌ Error handling checkout session completed:', error);
        }
    }
    static async handlePaymentIntentSucceeded(paymentIntent) {
        try {
            console.log('✅ Payment intent succeeded:', paymentIntent.id);
            const { bookingId } = paymentIntent.metadata;
            if (!bookingId)
                return;
            await Payment_1.Payment.findOneAndUpdate({ paymentIntentId: paymentIntent.id }, { status: 'succeeded' });
            console.log('✅ Payment status updated to succeeded');
        }
        catch (error) {
            console.error('❌ Error handling payment intent succeeded:', error);
        }
    }
    static async handlePaymentIntentFailed(paymentIntent) {
        try {
            console.log('❌ Payment intent failed:', paymentIntent.id);
            const { bookingId } = paymentIntent.metadata;
            if (!bookingId)
                return;
            await Payment_1.Payment.findOneAndUpdate({ paymentIntentId: paymentIntent.id }, { status: 'failed' });
            const { clientId, providerId } = paymentIntent.metadata;
            if (clientId) {
                await this.createNotification(clientId, 'Payment Failed', 'Your payment could not be processed. Please try again.');
            }
            console.log('✅ Payment status updated to failed');
        }
        catch (error) {
            console.error('❌ Error handling payment intent failed:', error);
        }
    }
    static async handleAccountUpdated(account) {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            console.log('🔄 Account updated:', account.id);
            await StripeAccount_1.StripeAccount.findOneAndUpdate({ accountId: account.id }, {
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
            console.log('✅ Account data updated');
        }
        catch (error) {
            console.error('❌ Error handling account updated:', error);
        }
    }
    static async handlePayoutPaid(payout) {
        try {
            console.log('💰 Payout paid:', payout.id);
            const stripeAccount = await StripeAccount_1.StripeAccount.findOne({ accountId: payout.destination });
            if (!stripeAccount)
                return;
            await this.createNotification(stripeAccount.userId, 'Payout Received', `Your payout of $${(0, stripe_1.formatAmountFromStripe)(payout.amount)} has been sent to your bank account.`);
            console.log('✅ Payout notification created');
        }
        catch (error) {
            console.error('❌ Error handling payout paid:', error);
        }
    }
    static async handleChargeDisputeCreated(dispute) {
        try {
            console.log('⚠️ Charge dispute created:', dispute.id);
            const payment = await Payment_1.Payment.findOne({ paymentIntentId: dispute.payment_intent });
            if (!payment)
                return;
            await Promise.all([
                this.createNotification(payment.clientId, 'Dispute Created', 'A dispute has been created for your payment. Please review the details.'),
                this.createNotification(payment.providerId, 'Payment Disputed', 'A customer has disputed a payment. Please review the details and provide evidence if needed.'),
            ]);
            console.log('✅ Dispute notifications created');
        }
        catch (error) {
            console.error('❌ Error handling dispute created:', error);
        }
    }
    static async handleRefundCreated(refund) {
        var _a;
        try {
            console.log('💸 Refund created:', refund.id);
            const payment = await Payment_1.Payment.findOne({ paymentIntentId: refund.payment_intent });
            if (!payment)
                return;
            (_a = payment.refunds) === null || _a === void 0 ? void 0 : _a.push({
                refundId: refund.id,
                amountCents: refund.amount,
                reason: refund.reason || 'requested_by_customer',
                createdAt: new Date(),
            });
            await payment.save();
            await Promise.all([
                this.createNotification(payment.clientId, 'Refund Processed', `Your refund of $${(0, stripe_1.formatAmountFromStripe)(refund.amount)} has been processed.`),
                this.createNotification(payment.providerId, 'Refund Issued', `A refund of $${(0, stripe_1.formatAmountFromStripe)(refund.amount)} has been issued for a payment.`),
            ]);
            console.log('✅ Refund notifications created');
        }
        catch (error) {
            console.error('❌ Error handling refund created:', error);
        }
    }
    static async createPaymentNotifications(clientId, providerId, bookingId, amountCents) {
        try {
            const amount = (0, stripe_1.formatAmountFromStripe)(amountCents);
            await Promise.all([
                this.createNotification(clientId, 'Payment Successful', `Your payment of $${amount} has been processed successfully.`),
                this.createNotification(providerId, 'Payment Received', `You have received a payment of $${amount} for booking ${bookingId}.`),
            ]);
        }
        catch (error) {
            console.error('❌ Error creating payment notifications:', error);
        }
    }
    static async createNotification(userId, title, message) {
        try {
            const notification = new Notification_1.Notification({
                userId,
                title,
                message,
                read: false,
            });
            await notification.save();
        }
        catch (error) {
            console.error('❌ Error creating notification:', error);
        }
    }
}
exports.StripeWebhookController = StripeWebhookController;
//# sourceMappingURL=stripeWebhookController.js.map