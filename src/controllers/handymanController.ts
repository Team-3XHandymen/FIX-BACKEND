import { Request, Response } from 'express';
import { ProviderPrivateData } from '../models/ProviderPrivateData';
import { ServiceProvider } from '../models/ServiceProvider';
import { Service } from '../models/Service';
import { ApiResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Register a new handyman
export const registerHandyman = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      clerkUserId, // Add Clerk user ID from request body
      name,
      nic,
      contactNumber,
      emailAddress,
      personalPhoto,
      experience,
      certifications,
      services,
      location,
      availability,
      paymentMethod
    } = req.body;

    // Validate required fields
    if (!clerkUserId || !name || !nic || !contactNumber || !emailAddress || !experience || !location) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields. Please provide all required information including Clerk user ID.',
        missingFields: {
          clerkUserId: !clerkUserId,
          name: !name,
          nic: !nic,
          contactNumber: !contactNumber,
          emailAddress: !emailAddress,
          experience: !experience,
          location: !location
        }
      } as ApiResponse);
      return;
    }

    // Validate services field
    if (!services || !Array.isArray(services) || services.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Services field is required and must be a non-empty array.',
      } as ApiResponse);
      return;
    }

    // Validate location field
    if (!location || location.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Missing required location field. Please provide your location.',
      } as ApiResponse);
      return;
    }

    // Validate availability fields
    if (!availability.workingDays || !availability.workingHours) {
      // Set default values if not provided
      if (!availability.workingDays) availability.workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      if (!availability.workingHours) availability.workingHours = ['9:00 AM - 5:00 PM'];
    }

    // Use the Clerk user ID from the request body
    const userId = clerkUserId;

    // Check if handyman already exists by Clerk user ID
    const existingHandymanByUserId = await ServiceProvider.findOne({ userId });
    if (existingHandymanByUserId) {
      res.status(400).json({
        success: false,
        message: 'A handyman with this user ID is already registered.',
      } as ApiResponse);
      return;
    }

    // Check if handyman already exists by email or NIC
    const existingHandymanByEmail = await ProviderPrivateData.findOne({ emailAddress });
    const existingHandymanByNIC = await ProviderPrivateData.findOne({ nic });
    
    if (existingHandymanByEmail) {
      res.status(400).json({
        success: false,
        message: 'A handyman with this email address is already registered.',
      } as ApiResponse);
      return;
    }

    if (existingHandymanByNIC) {
      res.status(400).json({
        success: false,
        message: 'A handyman with this NIC is already registered.',
      } as ApiResponse);
      return;
    }

    // Map service IDs to service objects
    let serviceIds: string[] = [];
    if (services && services.length > 0) {
      
      // Check if services are already valid ObjectIds (service IDs)
      const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
      
      const areAllObjectIds = services.every((service: string) => isValidObjectId(service));
      
      if (areAllObjectIds) {
        // Services are already IDs, use them directly
        serviceIds = services;
      } else {
        // Services are names, find them by name and get their IDs
        const foundServices = await Service.find({ 
          name: { $in: services.map((s: string) => new RegExp(s, 'i')) }
        });
        serviceIds = foundServices.map(service => service._id?.toString() || '');
        
        // If no services found, create them (this handles the case where services don't exist yet)
        if (serviceIds.length === 0) {
          for (const serviceName of services) {
            if (serviceName !== 'other') { // Skip 'other' as it's not a real service
              const newService = new Service({
                name: serviceName,
                description: `${serviceName} services`,
                baseFee: 50, // Default base fee
                imageUrl: '', // Default empty image
                usageCount: 0
              });
              const savedService = await newService.save();
              if (savedService._id) {
                serviceIds.push(savedService._id.toString());
              }
            }
          }
        }
      }
    }
    
    // Filter out empty service IDs
    serviceIds = serviceIds.filter(id => id !== '');
    
    // If still no services, create a default service
    if (serviceIds.length === 0) {
      const defaultService = new Service({
        name: 'General Handyman',
        description: 'General handyman services',
        baseFee: 50,
        imageUrl: '',
        usageCount: 0
      });
      const savedDefaultService = await defaultService.save();
      if (savedDefaultService._id) {
        serviceIds.push(savedDefaultService._id.toString());
      }
    }

    // Extract coordinates from request if provided
    const coordinates = req.body.coordinates ? {
      lat: req.body.coordinates.lat,
      lng: req.body.coordinates.lng
    } : undefined;

    // Create new handyman private data with default values for optional fields
    const handymanPrivateData = new ProviderPrivateData({
      userId,
      name,
      nic,
      contactNumber,
      emailAddress,
      personalPhoto: personalPhoto || '',
      experience,
      certifications: certifications || [],
      services: serviceIds, // Only service IDs, no skills array
      location: location, // Use the location field directly
      coordinates: coordinates, // Add coordinates for distance calculations
      availability: {
        workingDays: availability.workingDays,
        workingHours: availability.workingHours,
      },
      paymentMethod: paymentMethod || 'Cash',
      totalEarnings: 0,
      upcomingBookings: [],
      schedule: {},
      notifications: [], // Empty array for notifications
      oldBookings: [],
    });

    await handymanPrivateData.save();

    // Create public service provider profile
    const serviceProvider = new ServiceProvider({
      userId,
      name,
      serviceIds: serviceIds,
      experience: `${experience} years`,
      rating: 0,
      location: location, // Use the location field directly
      coordinates: coordinates, // Add coordinates for distance calculations
      bio: `Experienced handyman with ${experience} years of experience.`,
      doneJobsCount: 0,
      availability: {},
    });

    await serviceProvider.save();

    res.status(201).json({
      success: true,
      message: 'Handyman registered successfully.',
      data: {
        handymanId: handymanPrivateData._id,
        serviceProviderId: serviceProvider._id,
        userId: userId,
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Register handyman error:', error);
    
    // Check if it's a Mongoose validation error
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      } as ApiResponse);
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
};

// Get handyman profile by user ID
export const getHandymanProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated.',
      } as ApiResponse);
      return;
    }

    const handymanData = await ProviderPrivateData.findOne({ userId })
      .select('name services experience location availability')
      .lean();
    
    if (!handymanData) {
      res.status(404).json({
        success: false,
        message: 'Handyman profile not found.',
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Handyman profile retrieved successfully.',
      data: handymanData,
    } as ApiResponse);
  } catch (error) {
    console.error('Get handyman profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
};

// Get handyman profile by userId (for checking dual role)
export const getHandymanProfileByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required.',
      } as ApiResponse);
      return;
    }

    const handymanData = await ServiceProvider.findOne({ userId })
      .select('name serviceIds experience location availability')
      .lean();
    
    if (!handymanData) {
      res.status(404).json({
        success: false,
        message: 'Handyman profile not found.',
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Handyman profile retrieved successfully.',
      data: handymanData,
    } as ApiResponse);
  } catch (error) {
    console.error('Get handyman profile by userId error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
};

// Update handyman profile
export const updateHandymanProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const updates = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated.',
      } as ApiResponse);
      return;
    }

    const handymanData = await ProviderPrivateData.findOneAndUpdate(
      { userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!handymanData) {
      res.status(404).json({
        success: false,
        message: 'Handyman profile not found.',
      } as ApiResponse);
      return;
    }

    // Also update the public service provider profile if relevant fields changed
    if (updates.services || updates.experience || updates.location || updates.coordinates) {
      const serviceProviderUpdates: any = {};
      
      if (updates.services) serviceProviderUpdates.serviceIds = updates.services;
      if (updates.experience) serviceProviderUpdates.experience = `${updates.experience} years`;
      if (updates.location) {
        serviceProviderUpdates.location = updates.location;
      }
      if (updates.coordinates) {
        serviceProviderUpdates.coordinates = updates.coordinates;
      }

      await ServiceProvider.findOneAndUpdate(
        { userId },
        serviceProviderUpdates,
        { new: true, runValidators: true }
      );
    }

    res.json({
      success: true,
      message: 'Handyman profile updated successfully.',
      data: handymanData,
    } as ApiResponse);
  } catch (error) {
    console.error('Update handyman profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
};

// Get all handymen (for admin purposes)
export const getAllHandymen = async (req: Request, res: Response): Promise<void> => {
  try {
    const handymen = await ProviderPrivateData.find()
      .select('name services experience location availability')
      .sort({ createdAt: -1 });

    // Map the response to include service names
    const handymenWithServiceNames = await Promise.all(
      handymen.map(async (handyman) => {
        const serviceNames = [];
        if (handyman.services && handyman.services.length > 0) {
          const foundServices = await Service.find({ _id: { $in: handyman.services } });
          serviceNames.push(...foundServices.map(service => service.name));
        }
        
        return {
          ...handyman,
          services: serviceNames, // Replace services with service names
        };
      })
    );

    res.json({
      success: true,
      message: 'Handymen retrieved successfully.',
      data: handymenWithServiceNames,
    } as ApiResponse);
  } catch (error) {
    console.error('Get all handymen error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
};

// Get service providers by service ID
export const getServiceProvidersByServiceId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serviceId } = req.params;

    if (!serviceId) {
      res.status(400).json({
        success: false,
        message: 'Service ID is required.',
      } as ApiResponse);
      return;
    }

    // Find service providers that offer this service
    const serviceProviders = await ServiceProvider.find({
      serviceIds: serviceId
    });

    if (!serviceProviders.length) {
      res.json({
        success: true,
        message: 'No service providers found for this service.',
        data: [],
      } as ApiResponse);
      return;
    }

    // Get the user IDs of these service providers
    const userIds = serviceProviders.map(provider => provider.userId);

    // Get the private data (names, etc.) for these providers
    const providerPrivateData = await ProviderPrivateData.find({
      userId: { $in: userIds }
    });

    // Get all services to map service IDs to service names
    const allServices = await Service.find({}, '_id name');
    const serviceMap = new Map(allServices.map(service => [(service._id as any).toString(), service.name]));

    // Combine the data
    const combinedProviders = serviceProviders.map(provider => {
      // Get service names for this provider
      const serviceNames = provider.serviceIds
        .map(serviceId => serviceMap.get(serviceId.toString()))
        .filter(Boolean); // Remove any undefined values
      
      const result = {
        _id: provider._id,
        userId: provider.userId,
        name: provider.name, // Use name directly from ServiceProvider
        status: "Available Now", // You can implement availability logic here
        title: serviceNames.join(', ') || provider.bio,
        rating: provider.rating,
        reviews: Math.floor(Math.random() * 200) + 50, // Dummy reviews count
        jobsCompleted: provider.doneJobsCount,
        yearsExp: parseInt(provider.experience.replace(/\D/g, '')) || 0,
        distance: (Math.random() * 5 + 1).toFixed(1), // Dummy distance
        services: serviceNames, // Replace skills with services
        bio: provider.bio,
        location: provider.location, // Now a simple string
        availability: provider.availability,
      };
      
      
      return result;
    });

    res.json({
      success: true,
      message: 'Service providers retrieved successfully.',
      data: combinedProviders,
    } as ApiResponse);
  } catch (error) {
    console.error('Get service providers by service ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
};

// Get available services for handyman registration
export const getAvailableServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const services = await Service.find({}, '_id name description baseFee imageUrl');
    
    res.json({
      success: true,
      message: 'Available services retrieved successfully.',
      data: services,
    } as ApiResponse);
  } catch (error) {
    console.error('Get available services error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
}; 