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
    username?: string;
    first_name?: string;
    last_name?: string;
    public_metadata?: any;
    unsafe_metadata?: any;
  };
}

export class WebhookController {
  /**
   * Handle Clerk webhooks for user events
   */
  static async handleClerkWebhook(req: Request, res: Response) {
    try {
      const { type, data } = req.body as ClerkWebhookPayload;

      // Handle user creation
      if (type === 'user.created') {
        await WebhookController.handleUserCreated(data);
      }
      // Handle user updates
      else if (type === 'user.updated') {
        await WebhookController.handleUserUpdated(data);
      }
      // Handle user deletion
      else if (type === 'user.deleted') {
        await WebhookController.handleUserDeleted(data.id);
      }

      res.status(200).json({ success: true, message: 'Webhook processed successfully' });

    } catch (error: any) {
      console.error('Webhook processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process webhook',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Handle new user creation from Clerk
   */
  private static async handleUserCreated(userData: ClerkWebhookPayload['data']) {
    try {
      const { id: clerkUserId, email_addresses, username, first_name, last_name, unsafe_metadata } = userData;

      // Check if user already exists
      const existingClient = await Client.findOne({ userId: clerkUserId });
      const existingHandyman = await ServiceProvider.findOne({ userId: clerkUserId });

      if (existingClient || existingHandyman) {
        console.log(`User ${clerkUserId} already exists in database`);
        return;
      }

      // Extract user information
      const email = email_addresses?.[0]?.email_address || '';
      const fullName = [first_name, last_name].filter(Boolean).join(' ') || '';
      const mobileNumber = unsafe_metadata?.mobileNumber || '';
      const acceptMarketing = unsafe_metadata?.acceptMarketing || false;

      // Determine user type based on metadata or default to client
      const userType = unsafe_metadata?.userType || 'client';

      if (userType === 'client') {
        // Create new client
        const newClient = new Client({
          userId: clerkUserId,
          name: fullName || username || 'New User',
          mobileNumber: mobileNumber || '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
          },
          location: '',
          preferences: {
            marketingConsent: acceptMarketing
          }
        });

        await newClient.save();
        console.log(`Client created for Clerk user: ${clerkUserId}`);

      } else if (userType === 'handyman') {
        // Create new handyman
        const newHandyman = new ServiceProvider({
          userId: clerkUserId,
          name: fullName || username || 'New Handyman',
          mobileNumber: mobileNumber || '',
          email: email,
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
          },
          location: '',
          services: [],
          rating: 0,
          isVerified: false,
          isActive: true
        });

        await newHandyman.save();
        console.log(`Handyman created for Clerk user: ${clerkUserId}`);
      }

    } catch (error: any) {
      console.error('Error creating user from webhook:', error);
      throw error;
    }
  }

  /**
   * Handle user updates from Clerk
   */
  private static async handleUserUpdated(userData: ClerkWebhookPayload['data']) {
    try {
      const { id: clerkUserId, email_addresses, username, first_name, last_name, unsafe_metadata } = userData;

      // Update client if exists
      const client = await Client.findOne({ userId: clerkUserId });
      if (client) {
        const updates: any = {};
        
        if (first_name || last_name) {
          updates.name = [first_name, last_name].filter(Boolean).join(' ') || client.name;
        }
        
        if (unsafe_metadata?.mobileNumber) {
          updates.mobileNumber = unsafe_metadata.mobileNumber;
        }
        
        if (unsafe_metadata?.acceptMarketing !== undefined) {
          updates.preferences = {
            ...client.preferences,
            marketingConsent: unsafe_metadata.acceptMarketing
          };
        }

        if (Object.keys(updates).length > 0) {
          await Client.findOneAndUpdate(
            { userId: clerkUserId },
            { $set: updates },
            { new: true }
          );
          console.log(`Client updated for Clerk user: ${clerkUserId}`);
        }
      }

      // Update handyman if exists
      const handyman = await ServiceProvider.findOne({ userId: clerkUserId });
      if (handyman) {
        const updates: any = {};
        
        if (first_name || last_name) {
          updates.name = [first_name, last_name].filter(Boolean).join(' ') || handyman.name;
        }
        
        if (unsafe_metadata?.mobileNumber) {
          updates.mobileNumber = unsafe_metadata.mobileNumber;
        }

        if (Object.keys(updates).length > 0) {
          await ServiceProvider.findOneAndUpdate(
            { userId: clerkUserId },
            { $set: updates },
            { new: true }
          );
          console.log(`Handyman updated for Clerk user: ${clerkUserId}`);
        }
      }

    } catch (error: any) {
      console.error('Error updating user from webhook:', error);
      throw error;
    }
  }

  /**
   * Handle user deletion from Clerk
   */
  private static async handleUserDeleted(clerkUserId: string) {
    try {
      // Delete client if exists
      const deletedClient = await Client.findOneAndDelete({ userId: clerkUserId });
      if (deletedClient) {
        console.log(`Client deleted for Clerk user: ${clerkUserId}`);
      }

      // Delete handyman if exists
      const deletedHandyman = await ServiceProvider.findOneAndDelete({ userId: clerkUserId });
      if (deletedHandyman) {
        console.log(`Handyman deleted for Clerk user: ${clerkUserId}`);
      }

    } catch (error: any) {
      console.error('Error deleting user from webhook:', error);
      throw error;
    }
  }
}
