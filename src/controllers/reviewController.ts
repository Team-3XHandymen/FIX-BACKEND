import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { Booking } from '../models/Booking';
import { ServiceProvider } from '../models/ServiceProvider';

interface CreateReviewRequest extends Request {
  body: {
    bookingId: string;
    rating: number; // 1-5
    comment: string;
    shortDescription?: string;
    selectedIssues?: string[];
    detailedFeedback?: string;
  };
}

/**
 * Create a new review for a completed booking
 */
export const createReview = async (req: CreateReviewRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, rating, comment, shortDescription, selectedIssues, detailedFeedback } = req.body;
    const clientId = req.user?.id;

    if (!clientId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    // Validate input
    if (!bookingId || !rating || !comment) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: bookingId, rating, and comment are required',
      });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
      return;
    }

    // Check if booking exists and belongs to the client
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    if (booking.clientId !== clientId) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only review your own bookings',
      });
      return;
    }

    // Check if booking is done or completed (handyman has marked as done)
    if (booking.status !== 'done' && booking.status !== 'completed') {
      res.status(400).json({
        success: false,
        message: 'You can only review bookings where work has been completed',
      });
      return;
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      res.status(409).json({
        success: false,
        message: 'Review already exists for this booking',
      });
      return;
    }

    // Create the review
    const review = new Review({
      bookingId,
      from: clientId,
      to: booking.providerId,
      rating,
      comment,
      shortDescription,
      selectedIssues: selectedIssues || [],
      detailedFeedback,
    });

    await review.save();

    // Update provider's average rating
    const reviews = await Review.find({ to: booking.providerId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await ServiceProvider.findOneAndUpdate(
      { userId: booking.providerId },
      { rating: Math.round(avgRating * 10) / 10 } // Round to 1 decimal place
    );

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get all reviews for a specific service provider
 */
export const getProviderReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { providerId } = req.params;

    if (!providerId) {
      res.status(400).json({
        success: false,
        message: 'Provider ID is required',
      });
      return;
    }

    const reviews = await Review.find({ to: providerId })
      .sort({ createdAt: -1 })
      .populate('from', 'name username')
      .populate('bookingId', 'serviceName');

    res.json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: reviews,
    });
  } catch (error) {
    console.error('Error getting provider reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get review for a specific booking
 */
export const getBookingReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      res.status(400).json({
        success: false,
        message: 'Booking ID is required',
      });
      return;
    }

    const review = await Review.findOne({ bookingId });

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Review retrieved successfully',
      data: review,
    });
  } catch (error) {
    console.error('Error getting booking review:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

