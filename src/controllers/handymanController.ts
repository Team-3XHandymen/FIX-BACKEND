import { Request, Response } from 'express';
import { ProviderPrivateData } from '../models/ProviderPrivateData';
import { ServiceProvider } from '../models/ServiceProvider';
import { Service } from '../models/Service';
import { ApiResponse } from '../types';

// Register a new handyman
export const registerHandyman = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      nic,
      contactNumber,
      emailAddress,
      personalPhoto,
      skills,
      experience,
      certifications,
      services,
      address,
      availability,
      paymentMethod
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated.',
      } as ApiResponse);
      return;
    }

    // Check if handyman already exists
    const existingHandyman = await ProviderPrivateData.findOne({ userId });
    if (existingHandyman) {
      res.status(400).json({
        success: false,
        message: 'Handyman already registered.',
      } as ApiResponse);
      return;
    }

    // Create new handyman private data
    const handymanPrivateData = new ProviderPrivateData({
      userId,
      name,
      nic,
      contactNumber,
      emailAddress,
      personalPhoto,
      skills,
      experience,
      certifications,
      services,
      address,
      availability,
      paymentMethod,
    });

    await handymanPrivateData.save();

    // Create public service provider profile
    const serviceProvider = new ServiceProvider({
      userId,
      serviceIds: services,
      experience: `${experience} years`,
      rating: 0,
      location: {
        city: address.city,
        area: address.state,
        coordinates: address.coordinates,
      },
      skills,
      bio: `Experienced handyman with ${experience} years of experience in ${skills.join(', ')}.`,
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
      },
    } as ApiResponse);
  } catch (error) {
    console.error('Register handyman error:', error);
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

    const handymanData = await ProviderPrivateData.findOne({ userId });
    
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
    if (updates.services || updates.skills || updates.experience || updates.address) {
      const serviceProviderUpdates: any = {};
      
      if (updates.services) serviceProviderUpdates.serviceIds = updates.services;
      if (updates.skills) serviceProviderUpdates.skills = updates.skills;
      if (updates.experience) serviceProviderUpdates.experience = `${updates.experience} years`;
      if (updates.address) {
        serviceProviderUpdates.location = {
          city: updates.address.city,
          area: updates.address.state,
          coordinates: updates.address.coordinates,
        };
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
      .select('name skills experience address availability')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Handymen retrieved successfully.',
      data: handymen,
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
        location: provider.location,
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