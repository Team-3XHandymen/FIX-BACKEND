import { Request, Response } from 'express';
import { stripe, formatAmountFromStripe } from '../config/stripe';
import { StripeAccount } from '../models/StripeAccount';
import { Payment } from '../models/Payment';
import { Booking } from '../models/Booking';
import { Notification } from '../models/Notification';
import { ApiResponse } from '../types';

export class StripeWebhookController {
  /**
   * Handle Stripe webhooks
   */
  static async handleWebhook(req: Request, res: Response) {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!endpointSecret) {
        console.error('❌ Stripe webhook secret not configured');
        return res.status(500).json({
          success: false,
          message: 'Webhook secret not configured',
        } as ApiResponse);
      }

      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err: any) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return res.status(400).json({
          success: false,
          message: `Webhook Error: ${err.message}`,
        } as ApiResponse);
      }

      console.log(`🔔 Received webhook event: ${event.type}`);

      // Handle the event
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

    } catch (error: any) {
      console.error('❌ Webhook processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      } as ApiResponse);
    }
  }

  /**
   * Handle successful checkout session completion
   */
  private static async handleCheckoutSessionCompleted(session: any) {
    try {
      console.log('✅ Checkout session completed:', session.id);

      const { bookingId, clientId, providerId } = session.metadata;

      if (!bookingId) {
        console.error('❌ No booking ID in session metadata');
        return;
      }

      // Get the payment intent to get more details
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
      
      // Create payment record
      const payment = new Payment({
        bookingId,
        paymentIntentId: paymentIntent.id,
        sessionId: session.id,
        amountCents: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'succeeded',
        applicationFeeCents: paymentIntent.application_fee_amount || 0,
        providerAccountId: paymentIntent.transfer_data?.destination || '',
        clientId,
        providerId,
        metadata: {
          bookingId,
          serviceName: paymentIntent.metadata?.serviceName,
          providerName: paymentIntent.metadata?.providerName,
          clientName: paymentIntent.metadata?.clientName,
        },
      });

      await payment.save();

      // Update booking status to 'paid'
      await Booking.findByIdAndUpdate(bookingId, { status: 'paid' });

      // Create notifications
      await this.createPaymentNotifications(clientId, providerId, bookingId, paymentIntent.amount);

      // Create Google Calendar event if provider has connected calendar
      try {
        const { GoogleCalendarService } = await import('../services/googleCalendarService');
        const booking = await Booking.findById(bookingId);
        
        if (booking && await GoogleCalendarService.isConnected(providerId)) {
          await GoogleCalendarService.createBookingEvent(providerId, {
            _id: booking._id.toString(),
            serviceName: booking.serviceName,
            clientName: booking.clientName,
            scheduledTime: booking.scheduledTime,
            location: booking.location,
            description: booking.description,
            fee: booking.fee,
          });
          console.log('✅ Google Calendar event created for booking:', bookingId);
        }
      } catch (calendarError: any) {
        // Don't fail the payment if calendar event creation fails
        console.error('⚠️ Failed to create calendar event (non-critical):', calendarError.message);
      }

      console.log('✅ Payment record created and booking updated');

    } catch (error) {
      console.error('❌ Error handling checkout session completed:', error);
    }
  }

  /**
   * Handle successful payment intent
   */
  private static async handlePaymentIntentSucceeded(paymentIntent: any) {
    try {
      console.log('✅ Payment intent succeeded:', paymentIntent.id);

      const { bookingId } = paymentIntent.metadata;
      if (!bookingId) return;

      // Update payment status if it exists
      await Payment.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        { status: 'succeeded' }
      );

      console.log('✅ Payment status updated to succeeded');

    } catch (error) {
      console.error('❌ Error handling payment intent succeeded:', error);
    }
  }

  /**
   * Handle failed payment intent
   */
  private static async handlePaymentIntentFailed(paymentIntent: any) {
    try {
      console.log('❌ Payment intent failed:', paymentIntent.id);

      const { bookingId } = paymentIntent.metadata;
      if (!bookingId) return;

      // Update payment status if it exists
      await Payment.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        { status: 'failed' }
      );

      // Create failure notification
      const { clientId, providerId } = paymentIntent.metadata;
      if (clientId) {
        await this.createNotification(clientId, 'Payment Failed', 'Your payment could not be processed. Please try again.');
      }

      console.log('✅ Payment status updated to failed');

    } catch (error) {
      console.error('❌ Error handling payment intent failed:', error);
    }
  }

  /**
   * Handle account updates (for Connect accounts)
   */
  private static async handleAccountUpdated(account: any) {
    try {
      console.log('🔄 Account updated:', account.id);

      await StripeAccount.findOneAndUpdate(
        { accountId: account.id },
        {
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          detailsSubmitted: account.details_submitted,
          requirements: {
            currentlyDue: account.requirements?.currently_due || [],
            eventuallyDue: account.requirements?.eventually_due || [],
            pastDue: account.requirements?.past_due || [],
            pendingVerification: account.requirements?.pending_verification || [],
            disabledReason: account.requirements?.disabled_reason,
          },
          capabilities: {
            cardPayments: account.capabilities?.card_payments === 'active',
            transfers: account.capabilities?.transfers === 'active',
          },
        }
      );

      console.log('✅ Account data updated');

    } catch (error) {
      console.error('❌ Error handling account updated:', error);
    }
  }

  /**
   * Handle payout paid (provider received money)
   */
  private static async handlePayoutPaid(payout: any) {
    try {
      console.log('💰 Payout paid:', payout.id);

      // Find the provider by account ID
      const stripeAccount = await StripeAccount.findOne({ accountId: payout.destination });
      if (!stripeAccount) return;

      // Create notification for provider
      await this.createNotification(
        stripeAccount.userId,
        'Payout Received',
        `Your payout of $${formatAmountFromStripe(payout.amount)} has been sent to your bank account.`
      );

      console.log('✅ Payout notification created');

    } catch (error) {
      console.error('❌ Error handling payout paid:', error);
    }
  }

  /**
   * Handle charge dispute created
   */
  private static async handleChargeDisputeCreated(dispute: any) {
    try {
      console.log('⚠️ Charge dispute created:', dispute.id);

      // Find payment by charge ID
      const payment = await Payment.findOne({ paymentIntentId: dispute.payment_intent });
      if (!payment) return;

      // Create notifications for both parties
      await Promise.all([
        this.createNotification(
          payment.clientId,
          'Dispute Created',
          'A dispute has been created for your payment. Please review the details.'
        ),
        this.createNotification(
          payment.providerId,
          'Payment Disputed',
          'A customer has disputed a payment. Please review the details and provide evidence if needed.'
        ),
      ]);

      console.log('✅ Dispute notifications created');

    } catch (error) {
      console.error('❌ Error handling dispute created:', error);
    }
  }

  /**
   * Handle refund created
   */
  private static async handleRefundCreated(refund: any) {
    try {
      console.log('💸 Refund created:', refund.id);

      // Find payment by payment intent ID
      const payment = await Payment.findOne({ paymentIntentId: refund.payment_intent });
      if (!payment) return;

      // Add refund to payment record
      payment.refunds?.push({
        refundId: refund.id,
        amountCents: refund.amount,
        reason: refund.reason || 'requested_by_customer',
        createdAt: new Date(),
      });

      await payment.save();

      // Create notifications
      await Promise.all([
        this.createNotification(
          payment.clientId,
          'Refund Processed',
          `Your refund of $${formatAmountFromStripe(refund.amount)} has been processed.`
        ),
        this.createNotification(
          payment.providerId,
          'Refund Issued',
          `A refund of $${formatAmountFromStripe(refund.amount)} has been issued for a payment.`
        ),
      ]);

      console.log('✅ Refund notifications created');

    } catch (error) {
      console.error('❌ Error handling refund created:', error);
    }
  }

  /**
   * Create payment-related notifications
   */
  private static async createPaymentNotifications(clientId: string, providerId: string, bookingId: string, amountCents: number) {
    try {
      const amount = formatAmountFromStripe(amountCents);

      await Promise.all([
        this.createNotification(
          clientId,
          'Payment Successful',
          `Your payment of $${amount} has been processed successfully.`
        ),
        this.createNotification(
          providerId,
          'Payment Received',
          `You have received a payment of $${amount} for booking ${bookingId}.`
        ),
      ]);
    } catch (error) {
      console.error('❌ Error creating payment notifications:', error);
    }
  }

  /**
   * Create a notification
   */
  private static async createNotification(userId: string, title: string, message: string) {
    try {
      const notification = new Notification({
        userId,
        title,
        message,
        read: false,
      });

      await notification.save();
    } catch (error) {
      console.error('❌ Error creating notification:', error);
    }
  }
}
