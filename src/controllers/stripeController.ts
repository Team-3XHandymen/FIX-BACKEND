import { Request, Response } from 'express';
import { stripe, STRIPE_CONFIG, calculateApplicationFee, formatAmountForStripe } from '../config/stripe';
import { StripeAccount } from '../models/StripeAccount';
import { Payment } from '../models/Payment';
import { Booking } from '../models/Booking';
import { ServiceProvider } from '../models/ServiceProvider';
import { Client } from '../models/Client';
import { ApiResponse } from '../types';

export class StripeController {
  /**
   * Create a Stripe Express account for a service provider
   */
  static async createProviderAccount(req: Request, res: Response) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        } as ApiResponse);
      }

      // Check if user already has a Stripe account
      const existingAccount = await StripeAccount.findOne({ userId });
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
        } as ApiResponse);
      }

      // Create Express account in Stripe
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // You can make this dynamic based on user location
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
      });

      // Save account to database
      const stripeAccount = new StripeAccount({
        userId,
        accountId: account.id,
        accountType: 'express',
        country: 'US',
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
        businessProfile: {
          name: account.business_profile?.name,
          url: account.business_profile?.url,
          supportEmail: account.business_profile?.support_email,
          supportPhone: account.business_profile?.support_phone,
        },
      });

      await stripeAccount.save();

      // Create onboarding link
      const onboardingUrl = await StripeController.createOnboardingLink(account.id);

      res.status(201).json({
        success: true,
        message: 'Stripe account created successfully',
        data: {
          accountId: account.id,
          onboardingUrl,
        },
      } as ApiResponse);

    } catch (error: any) {
      console.error('Error creating Stripe account:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create Stripe account',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      } as ApiResponse);
    }
  }

  /**
   * Create onboarding link for Express account
   */
  private static async createOnboardingLink(accountId: string): Promise<string> {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: STRIPE_CONFIG.ONBOARDING_REFRESH_URL,
      return_url: STRIPE_CONFIG.ONBOARDING_RETURN_URL,
      type: 'account_onboarding',
    });

    return accountLink.url;
  }

  /**
   * Get provider's Stripe account status
   */
  static async getProviderAccountStatus(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const stripeAccount = await StripeAccount.findOne({ userId });
      if (!stripeAccount) {
        return res.status(404).json({
          success: false,
          message: 'Stripe account not found',
        } as ApiResponse);
      }

      // Get fresh account data from Stripe
      const account = await stripe.accounts.retrieve(stripeAccount.accountId);
      
      // Debug logging
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
      
      // Additional debug for requirements
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

      // Update local data
      await StripeAccount.findByIdAndUpdate(stripeAccount._id, {
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
      });

      const needsOnboarding = account.requirements?.currently_due && account.requirements.currently_due.length > 0;
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
      } as ApiResponse);

    } catch (error: any) {
      console.error('Error getting account status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get account status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      } as ApiResponse);
    }
  }

  /**
   * Create a checkout session for a booking
   */
  static async createCheckoutSession(req: Request, res: Response) {
    try {
      const { bookingId } = req.body;
      const clientId = req.user?.id; // From auth middleware

      if (!bookingId || !clientId) {
        return res.status(400).json({
          success: false,
          message: 'Booking ID and client authentication required',
        } as ApiResponse);
      }

      // Get booking details
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        } as ApiResponse);
      }

      // Verify client owns this booking
      if (booking.clientId !== clientId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        } as ApiResponse);
      }

      // Check if booking is in correct status for payment
      if (booking.status !== 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'Booking must be accepted before payment',
        } as ApiResponse);
      }

      if (!booking.fee || booking.fee <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Booking fee not set',
        } as ApiResponse);
      }

      // Get provider's Stripe account
      const providerStripeAccount = await StripeAccount.findOne({ userId: booking.providerId });
      if (!providerStripeAccount) {
        return res.status(400).json({
          success: false,
          message: 'Provider has not set up payment account',
        } as ApiResponse);
      }

      if (!providerStripeAccount.chargesEnabled) {
        return res.status(400).json({
          success: false,
          message: 'Provider payment account is not ready',
        } as ApiResponse);
      }

      // Get client and provider names for metadata
      const client = await Client.findOne({ userId: booking.clientId });
      const provider = await ServiceProvider.findOne({ userId: booking.providerId });

      const amountCents = formatAmountForStripe(booking.fee);
      const applicationFeeCents = calculateApplicationFee(amountCents);

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: STRIPE_CONFIG.CURRENCY,
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
          application_fee_amount: applicationFeeCents,
          transfer_data: {
            destination: providerStripeAccount.accountId,
          },
          metadata: {
            bookingId: bookingId,
            clientId: booking.clientId,
            providerId: booking.providerId,
            serviceName: booking.serviceName,
            providerName: booking.providerName,
            clientName: client?.name || 'Client',
          },
        },
        success_url: `${STRIPE_CONFIG.PAYMENT_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
        cancel_url: `${STRIPE_CONFIG.PAYMENT_CANCEL_URL}?booking_id=${bookingId}`,
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
      } as ApiResponse);

    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create checkout session',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      } as ApiResponse);
    }
  }

  /**
   * Get payment details by booking ID
   */
  static async getPaymentByBookingId(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        } as ApiResponse);
      }

      const payment = await Payment.findOne({ bookingId });
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        } as ApiResponse);
      }

      // Check if user has access to this payment
      if (payment.clientId !== userId && payment.providerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        } as ApiResponse);
      }

      res.json({
        success: true,
        data: payment,
      } as ApiResponse);

    } catch (error: any) {
      console.error('Error getting payment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment details',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      } as ApiResponse);
    }
  }

  /**
   * Create a refund for a payment
   */
  static async createRefund(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const { amount, reason } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        } as ApiResponse);
      }

      const payment = await Payment.findOne({ paymentIntentId: paymentId });
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        } as ApiResponse);
      }

      // Check if user has permission to refund (typically provider or admin)
      if (payment.providerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        } as ApiResponse);
      }

      // Create refund in Stripe
      const refundAmount = amount ? formatAmountForStripe(amount) : undefined;
      const refund = await stripe.refunds.create({
        payment_intent: payment.paymentIntentId,
        amount: refundAmount,
        reason: reason || 'requested_by_customer',
      });

      // Update payment record
      payment.refunds?.push({
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
      } as ApiResponse);

    } catch (error: any) {
      console.error('Error creating refund:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create refund',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      } as ApiResponse);
    }
  }

  /**
   * Manual payment creation for testing (when webhooks don't work)
   */
  static async createManualPayment(req: Request, res: Response) {
    try {
      const { bookingId, sessionId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        } as ApiResponse);
      }

      if (!bookingId || !sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Booking ID and Session ID are required',
        } as ApiResponse);
      }

      // Get the session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (!session.payment_intent) {
        return res.status(400).json({
          success: false,
          message: 'No payment intent found in session',
        } as ApiResponse);
      }

      // Get the payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);

      // Get booking details
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        } as ApiResponse);
      }

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
        clientId: booking.clientId,
        providerId: booking.providerId,
        metadata: {
          bookingId,
          serviceName: booking.serviceName,
          providerName: booking.providerName,
        },
      });

      await payment.save();

      // Update booking status to 'paid'
      await Booking.findByIdAndUpdate(bookingId, { status: 'paid' });

      console.log('✅ Manual payment record created for booking:', bookingId);

      res.json({
        success: true,
        message: 'Payment record created successfully',
        data: payment,
      } as ApiResponse);

    } catch (error: any) {
      console.error('Error creating manual payment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment record',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      } as ApiResponse);
    }
  }
}
