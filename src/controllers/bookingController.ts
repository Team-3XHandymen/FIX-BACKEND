import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { ServiceProvider } from '../models/ServiceProvider';
import { ProviderPrivateData } from '../models/ProviderPrivateData';
import { ApiResponse, CreateBookingRequest, UpdateBookingRequest } from '../types';

// Create a new booking
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { description, location, providerId, serviceId, scheduledTime }: CreateBookingRequest = req.body;
    const clientId = req.user!.id; // From auth middleware
    
    // Validate that the provider exists and get their name
    const provider = await ServiceProvider.findOne({ userId: providerId });
    if (!provider) {
      res.status(404).json({
        success: false,
        message: 'Service provider not found.',
      } as ApiResponse);
      return;
    }
    
    // Validate that the provider offers this service
    if (!provider.serviceIds.includes(serviceId)) {
      res.status(400).json({
        success: false,
        message: 'Provider does not offer this service.',
      } as ApiResponse);
      return;
    }

    // Get the service name
    const { Service } = await import('../models/Service');
    const service = await Service.findById(serviceId);
    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found.',
      } as ApiResponse);
      return;
    }
    
    const booking = new Booking({
      description,
      location,
      clientId,
      providerId,
      serviceId,
      providerName: provider.name, // Store provider name directly
      serviceName: service.name,   // Store service name directly
      scheduledTime: new Date(scheduledTime),
      status: 'pending',
      fee: null, // Will be set by provider when accepting
    });
    
    await booking.save();
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: booking,
    } as ApiResponse);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
};

// Get bookings for current user (client or provider)
export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const userType = req.user!.type!;
    
    console.log('Getting bookings for user:', { userId, userType });
    
    let query: any = {};
    
    if (userType === 'client') {
      query.clientId = userId;
    } else if (userType === 'provider') {
      query.providerId = userId;
    }
    
    const bookings = await Booking.find(query)
      .sort({ scheduledTime: -1 });
    
    console.log(`Found ${bookings.length} bookings`);
    
    // No need to enrich data anymore since it's stored directly
    // Just map the data to include the names for frontend compatibility
    const enrichedBookings = bookings.map(booking => {
      console.log('Raw booking fields:', Object.keys(booking.toObject()));
      console.log('Booking serviceName:', booking.serviceName);
      console.log('Booking providerName:', booking.providerName);
      
      return {
        ...booking.toObject(),
        providerName: booking.providerName,
        serviceCategory: booking.serviceName
      };
    });
    
    console.log('Bookings with names:', enrichedBookings.map(b => ({ 
      id: b._id, 
      providerName: b.providerName, 
      serviceCategory: b.serviceCategory 
    })));
    
    res.json({
      success: true,
      message: 'Bookings retrieved successfully.',
      data: enrichedBookings,
    } as ApiResponse);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
};

// Get booking by ID
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found.',
      } as ApiResponse);
      return;
    }
    
    // Check if user has access to this booking
    if (booking.clientId !== userId && booking.providerId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied.',
      } as ApiResponse);
      return;
    }
    
    res.json({
      success: true,
      message: 'Booking retrieved successfully.',
      data: booking,
    } as ApiResponse);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
};

// Update booking (provider can accept/complete, client can cancel)
export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, fee, description }: UpdateBookingRequest = req.body;
    const userId = req.user!.id;
    const userType = req.user!.type!;
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found.',
      } as ApiResponse);
      return;
    }
    
    // Check permissions
    if (userType === 'client' && booking.clientId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied.',
      } as ApiResponse);
      return;
    }
    
    if (userType === 'provider' && booking.providerId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied.',
      } as ApiResponse);
      return;
    }
    
    // Update booking
    const updates: any = {};
    if (status) updates.status = status;
    if (fee !== undefined) updates.fee = fee;
    if (description) updates.description = description;
    
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    // If booking is marked as done, update provider stats
    if (status === 'done' && userType === 'provider') {
      await updateProviderStats(userId, booking._id?.toString() || '', fee || 0);
    }
    
    res.json({
      success: true,
      message: 'Booking updated successfully.',
      data: updatedBooking,
    } as ApiResponse);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
};

// Helper function to update provider stats when booking is completed
const updateProviderStats = async (providerId: string, bookingId: string, fee: number) => {
  try {
    // Update service provider stats
    await ServiceProvider.findOneAndUpdate(
      { userId: providerId },
      { $inc: { doneJobsCount: 1 } }
    );
    
    // Update provider private data
    await ProviderPrivateData.findOneAndUpdate(
      { userId: providerId },
      {
        $inc: { totalEarnings: fee },
        $push: { oldBookings: bookingId },
        $pull: { upcomingBookings: bookingId }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error updating provider stats:', error);
  }
};

// Get pending bookings for providers
export const getPendingBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const providerId = req.user!.id;
    
    const bookings = await Booking.find({
      providerId,
      status: 'pending'
    })
    .sort({ scheduledTime: 1 })
    .populate('serviceId', 'name baseFee');
    
    res.json({
      success: true,
      message: 'Pending bookings retrieved successfully.',
      data: bookings,
    } as ApiResponse);
  } catch (error) {
    console.error('Get pending bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
}; 