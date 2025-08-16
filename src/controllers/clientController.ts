import { Request, Response } from 'express';
import { Client } from '../models/Client';
import { ApiResponse } from '../types';

// Create a new client when they first log in
export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, username, email } = req.body;

    // Validate required fields
    if (!userId || !username || !email) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, username, and email are required.',
        missingFields: {
          userId: !userId,
          username: !username,
          email: !email,
        }
      } as ApiResponse);
      return;
    }

    // Check if client already exists (only userId needs to be unique)
    const existingClient = await Client.findOne({ userId });
    if (existingClient) {
      res.status(409).json({
        success: false,
        message: 'Client already exists with this userId.',
        data: existingClient,
      } as ApiResponse);
      return;
    }



    // Create new client with minimal data
    const newClient = new Client({
      userId,
      username,
      email,
      // All other fields remain undefined/null until profile completion
    });

    await newClient.save();

    res.status(201).json({
      success: true,
      message: 'Client created successfully.',
      data: newClient,
    } as ApiResponse);

  } catch (error: unknown) {
    console.error('Create client error:', error);
    
    // Handle duplicate key errors (MongoDB duplicate key error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      const mongoError = error as { keyPattern?: Record<string, any> };
      const field = mongoError.keyPattern ? Object.keys(mongoError.keyPattern)[0] : 'unknown';
      
      // Since only userId should be unique, this error should only occur for userId
      if (field === 'userId') {
        res.status(409).json({
          success: false,
          message: 'Client already exists with this userId.',
        } as ApiResponse);
      } else {
        res.status(409).json({
          success: false,
          message: `${field} already exists.`,
        } as ApiResponse);
      }
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
};

// Get client by userId (Clerk ID)
export const getClientByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const client = await Client.findOne({ userId });
    
    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found.',
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Client retrieved successfully.',
      data: client,
    } as ApiResponse);

  } catch (error: unknown) {
    console.error('Get client error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
};

// Update client profile (for completing profile)
export const updateClientProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.userId;
    delete updates.username;
    delete updates.email;
    delete updates.createdAt;
    delete updates.updatedAt;

    const client = await Client.findOneAndUpdate(
      { userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found.',
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Client profile updated successfully.',
      data: client,
    } as ApiResponse);

  } catch (error: unknown) {
    console.error('Update client profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
};

// Get all clients (for admin purposes)
export const getAllClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: 'Clients retrieved successfully.',
      data: clients,
    } as ApiResponse);

  } catch (error: unknown) {
    console.error('Get all clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
};
