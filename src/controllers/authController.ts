import { Request, Response } from 'express';
import { Client } from '../models/Client';
import { ServiceProvider } from '../models/ServiceProvider';

interface CreateUserRequest {
  clerkUserId: string;
  userType: 'client' | 'handyman';
  userData: {
    username: string;
    fullName: string;
    mobileNumber: string;
    email: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    location?: string;
    acceptMarketing?: boolean;
  };
}

export class AuthController {
  /**
   * Create a new user in the database after Clerk authentication
   */
  static async createUser(req: Request<{}, {}, CreateUserRequest>, res: Response) {
    try {
      const { clerkUserId, userType, userData } = req.body;

      // Validate required fields
      if (!clerkUserId || !userType || !userData) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: clerkUserId, userType, and userData are required'
        });
      }

      // Validate user data
      if (!userData.username || !userData.fullName || !userData.mobileNumber || !userData.email) {
        return res.status(400).json({
          success: false,
          message: 'Missing required user data: username, fullName, mobileNumber, and email are required'
        });
      }

      // Check if user already exists
      let existingUser;
      if (userType === 'client') {
        existingUser = await Client.findOne({ userId: clerkUserId });
      } else {
        existingUser = await ServiceProvider.findOne({ userId: clerkUserId });
      }

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists in the database'
        });
      }

      let newUser;

      if (userType === 'client') {
        // Create new client
        newUser = new Client({
          userId: clerkUserId,
          name: userData.fullName,
          mobileNumber: userData.mobileNumber,
          address: userData.address || {
            street: '',
            city: '',
            state: '',
            zipCode: ''
          },
          location: userData.location || '',
          preferences: {
            marketingConsent: userData.acceptMarketing || false
          }
        });

        await newUser.save();
      } else {
        // Create new handyman (basic structure, can be enhanced later)
        newUser = new ServiceProvider({
          userId: clerkUserId,
          name: userData.fullName,
          mobileNumber: userData.mobileNumber,
          email: userData.email,
          address: userData.address || {
            street: '',
            city: '',
            state: '',
            zipCode: ''
          },
          location: userData.location || '',
          services: [],
          rating: 0,
          isVerified: false,
          isActive: true
        });

        await newUser.save();
      }

      res.status(201).json({
        success: true,
        message: `${userType} created successfully`,
        data: {
          userId: newUser.userId,
          userType,
          name: newUser.name,
          email: userData.email
        }
      });

    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Handle specific MongoDB errors
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this information'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Get user profile by Clerk user ID
   */
  static async getUserProfile(req: Request, res: Response) {
    try {
      const { clerkUserId, userType } = req.params;

      if (!clerkUserId || !userType) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters: clerkUserId and userType'
        });
      }

      let user;
      if (userType === 'client') {
        user = await Client.findOne({ userId: clerkUserId });
      } else if (userType === 'handyman') {
        user = await ServiceProvider.findOne({ userId: clerkUserId });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid user type. Must be either "client" or "handyman"'
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });

    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(req: Request, res: Response) {
    try {
      const { clerkUserId, userType } = req.params;
      const updateData = req.body;

      if (!clerkUserId || !userType) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters: clerkUserId and userType'
        });
      }

      let user;
      if (userType === 'client') {
        user = await Client.findOneAndUpdate(
          { userId: clerkUserId },
          { $set: updateData },
          { new: true, runValidators: true }
        );
      } else if (userType === 'handyman') {
        user = await ServiceProvider.findOneAndUpdate(
          { userId: clerkUserId },
          { $set: updateData },
          { new: true, runValidators: true }
        );
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid user type. Must be either "client" or "handyman"'
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });

    } catch (error: any) {
      console.error('Error updating user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Delete user account
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const { clerkUserId, userType } = req.params;

      if (!clerkUserId || !userType) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters: clerkUserId and userType'
        });
      }

      let deletedUser;
      if (userType === 'client') {
        deletedUser = await Client.findOneAndDelete({ userId: clerkUserId });
      } else if (userType === 'handyman') {
        deletedUser = await ServiceProvider.findOneAndDelete({ userId: clerkUserId });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid user type. Must be either "client" or "handyman"'
        });
      }

      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'User account deleted successfully'
      });

    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user account',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}
