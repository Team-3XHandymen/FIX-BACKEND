import { Request, Response } from 'express';
import { GoogleCalendarService } from '../services/googleCalendarService';
import { ApiResponse } from '../types';

export class GoogleCalendarController {
  /**
   * Get OAuth authorization URL
   */
  static async getAuthUrl(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated.',
        } as ApiResponse);
        return;
      }

      const authUrl = GoogleCalendarService.getAuthUrl(userId);

      res.json({
        success: true,
        message: 'Authorization URL generated successfully.',
        data: { authUrl },
      } as ApiResponse);
    } catch (error: any) {
      console.error('Error generating auth URL:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate authorization URL.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      } as ApiResponse);
    }
  }

  /**
   * Handle OAuth callback
   */
  static async handleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, state } = req.query;

      if (!code || !state) {
        res.status(400).json({
          success: false,
          message: 'Missing authorization code or state.',
        } as ApiResponse);
        return;
      }

      const userId = state as string;
      await GoogleCalendarService.exchangeCodeForTokens(code as string, userId);

      // Redirect to frontend success page
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
      res.redirect(`${frontendUrl}/handyman/settings?calendar=connected`);
    } catch (error: any) {
      console.error('Error handling OAuth callback:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
      res.redirect(`${frontendUrl}/handyman/settings?calendar=error`);
    }
  }

  /**
   * Check connection status
   */
  static async getConnectionStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated.',
        } as ApiResponse);
        return;
      }

      const isConnected = await GoogleCalendarService.isConnected(userId);

      res.json({
        success: true,
        message: 'Connection status retrieved successfully.',
        data: { isConnected },
      } as ApiResponse);
    } catch (error: any) {
      console.error('Error getting connection status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get connection status.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      } as ApiResponse);
    }
  }

  /**
   * Disconnect Google Calendar
   */
  static async disconnect(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated.',
        } as ApiResponse);
        return;
      }

      await GoogleCalendarService.disconnect(userId);

      res.json({
        success: true,
        message: 'Google Calendar disconnected successfully.',
      } as ApiResponse);
    } catch (error: any) {
      console.error('Error disconnecting Google Calendar:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to disconnect Google Calendar.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      } as ApiResponse);
    }
  }
}

