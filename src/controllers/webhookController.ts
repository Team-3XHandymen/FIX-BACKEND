import { Request, Response } from 'express';
import { Client } from '../models/Client';
import { ServiceProvider } from '../models/ServiceProvider';

interface ClerkWebhookPayload {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{
      email_address: string;
      id: string;
    }>;
    first_name?: string;
    last_name?: string;
    username?: string;
    phone_numbers?: Array<{
      phone_number: string;
      id: string;
    }>;
    created_at: number;
    updated_at: number;
  };
  object: string;
}

export class WebhookController {
  /**
   * Handle Clerk webhook events
   */
  static async handleClerkWebhook(req: Request, res: Response) {
    try {
      const { type, data, object } = req.body as ClerkWebhookPayload;

      console.log('📨 Received Clerk webhook:', { type, object, userId: data?.id });

      // Verify this is a user event
      if (object !== 'user') {
        return res.status(400).json({
          success: false,
          message: 'Invalid webhook object type'
        });
      }

      switch (type) {
        case 'user.created':
          await this.handleUserCreated(data);
          break;
        
        case 'user.updated':
          await this.handleUserUpdated(data);
          break;
        
        case 'user.deleted':
          await this.handleUserDeleted(data);
          break;
        
        default:
          console.log(`⚠️ Unhandled webhook type: ${type}`);
      }

      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully'
      });

    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process webhook',
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : 'Internal server error'
      });
    }
  }

  /**
   * Handle user creation webhook
   */
  private static async handleUserCreated(userData: ClerkWebhookPayload['data']) {
    try {
      console.log('👤 Processing user.created webhook for:', userData.id);

      // Extract user information
      const email = userData.email_addresses?.[0]?.email_address;
      const firstName = userData.first_name || '';
      const lastName = userData.last_name || '';
      const username = userData.username || '';
      const phoneNumber = userData.phone_numbers?.[0]?.phone_number || '';

      if (!email) {
        console.warn('⚠️ User created without email:', userData.id);
        return;
      }

      // Check if user already exists in our database
      const existingClient = await Client.findOne({ userId: userData.id });
      const existingProvider = await ServiceProvider.findOne({ userId: userData.id });

      if (existingClient || existingProvider) {
        console.log('ℹ️ User already exists in database:', userData.id);
        return;
      }

      // For now, we'll create a basic client profile
      // In a real app, you might want to wait for the user to complete their profile
      const newClient = new Client({
        userId: userData.id,
        name: `${firstName} ${lastName}`.trim() || username || 'New User',
        mobileNumber: phoneNumber,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        location: '',
        preferences: {
          marketingConsent: false
        }
      });

      await newClient.save();
      console.log('✅ Created new client profile for:', userData.id);

    } catch (error) {
      console.error('❌ Error handling user.created webhook:', error);
    }
  }

  /**
   * Handle user update webhook
   */
  private static async handleUserUpdated(userData: ClerkWebhookPayload['data']) {
    try {
      console.log('🔄 Processing user.updated webhook for:', userData.id);

      // Extract updated user information
      const email = userData.email_addresses?.[0]?.email_address;
      const firstName = userData.first_name || '';
      const lastName = userData.last_name || '';
      const username = userData.username || '';
      const phoneNumber = userData.phone_numbers?.[0]?.phone_number || '';

      // Update client profile if it exists
      const client = await Client.findOne({ userId: userData.id });
      if (client) {
        const updates: any = {};
        
        if (firstName || lastName) {
          updates.name = `${firstName} ${lastName}`.trim();
        }
        
        if (phoneNumber) {
          updates.mobileNumber = phoneNumber;
        }

        if (Object.keys(updates).length > 0) {
          await Client.findOneAndUpdate(
            { userId: userData.id },
            { $set: updates },
            { new: true }
          );
          console.log('✅ Updated client profile for:', userData.id);
        }
      }

      // Update provider profile if it exists
      const provider = await ServiceProvider.findOne({ userId: userData.id });
      if (provider) {
        const updates: any = {};
        
        if (firstName || lastName) {
          updates.name = `${firstName} ${lastName}`.trim();
        }
        
        if (phoneNumber) {
          updates.mobileNumber = phoneNumber;
        }

        if (Object.keys(updates).length > 0) {
          await ServiceProvider.findOneAndUpdate(
            { userId: userData.id },
            { $set: updates },
            { new: true }
          );
          console.log('✅ Updated provider profile for:', userData.id);
        }
      }

    } catch (error) {
      console.error('❌ Error handling user.updated webhook:', error);
    }
  }

  /**
   * Handle user deletion webhook
   */
  private static async handleUserDeleted(userData: ClerkWebhookPayload['data']) {
    try {
      console.log('🗑️ Processing user.deleted webhook for:', userData.id);

      // Remove user from our database
      const deletedClient = await Client.findOneAndDelete({ userId: userData.id });
      const deletedProvider = await ServiceProvider.findOneAndDelete({ userId: userData.id });

      if (deletedClient) {
        console.log('✅ Deleted client profile for:', userData.id);
      }

      if (deletedProvider) {
        console.log('✅ Deleted provider profile for:', userData.id);
      }

      if (!deletedClient && !deletedProvider) {
        console.log('ℹ️ No profile found to delete for:', userData.id);
      }

    } catch (error) {
      console.error('❌ Error handling user.deleted webhook:', error);
    }
  }
}
