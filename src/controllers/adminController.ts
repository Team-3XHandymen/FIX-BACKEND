import { Request, Response } from 'express';
import { Client } from '../models/Client';
import { ServiceProvider } from '../models/ServiceProvider';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';
import { Service } from '../models/Service';

export class AdminController {
  // Get dashboard statistics
  static async getDashboardStats(req: Request, res: Response) {
    try {
      // Total clients count
      const totalClients = await Client.countDocuments();

      // Total handymen count
      const totalHandymen = await ServiceProvider.countDocuments();

      // Total bookings count
      const totalBookings = await Booking.countDocuments();

      // Bookings by status
      const bookingsByStatus = await Booking.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Convert to object format
      const statusCounts: Record<string, number> = {
        pending: 0,
        accepted: 0,
        rejected: 0,
        paid: 0,
        done: 0,
        completed: 0
      };

      bookingsByStatus.forEach((item) => {
        statusCounts[item._id] = item.count;
      });

      // Total platform revenue (sum of application fees from all succeeded payments)
      const revenueResult = await Payment.aggregate([
        {
          $match: {
            status: 'succeeded'
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$applicationFeeCents' }
          }
        }
      ]);

      const totalRevenue = revenueResult.length > 0 
        ? revenueResult[0].totalRevenue / 100 // Convert cents to dollars
        : 0;

      // Most popular services (by usage count)
      const popularServices = await Service.find()
        .sort({ usageCount: -1 })
        .limit(10)
        .select('name usageCount baseFee')
        .lean();

      res.json({
        success: true,
        data: {
          totalClients,
          totalHandymen,
          totalBookings,
          bookingsByStatus: statusCounts,
          totalRevenue,
          popularServices
        }
      });
    } catch (error: any) {
      console.error('Error fetching admin dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get bookings by location/city
  static async getBookingsByLocation(req: Request, res: Response) {
    try {
      const bookings = await Booking.find()
        .select('location status createdAt')
        .lean();

      // Group bookings by location
      const locationMap: Record<string, {
        location: string;
        total: number;
        byStatus: Record<string, number>;
      }> = {};

      bookings.forEach((booking) => {
        const location = booking.location?.address || 'Unknown Location';
        const city = location.split(',')[0].trim(); // Extract city from address

        if (!locationMap[city]) {
          locationMap[city] = {
            location: city,
            total: 0,
            byStatus: {
              pending: 0,
              accepted: 0,
              rejected: 0,
              paid: 0,
              done: 0,
              completed: 0
            }
          };
        }

        locationMap[city].total++;
        const status = booking.status || 'pending';
        if (locationMap[city].byStatus[status] !== undefined) {
          locationMap[city].byStatus[status]++;
        }
      });

      // Convert to array and sort by total bookings
      const bookingsByLocation = Object.values(locationMap)
        .sort((a, b) => b.total - a.total);

      res.json({
        success: true,
        data: bookingsByLocation
      });
    } catch (error: any) {
      console.error('Error fetching bookings by location:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bookings by location',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

