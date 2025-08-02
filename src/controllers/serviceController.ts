import { Request, Response } from 'express';
import { Service } from '../models/Service';
import { ApiResponse } from '../types';

// Get all services
export const getAllServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const services = await Service.find().sort({ name: 1 });
    
    res.json({
      success: true,
      message: 'Services retrieved successfully.',
      data: services,
    } as ApiResponse);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
};

// Get service by ID
export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    
    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found.',
      } as ApiResponse);
      return;
    }
    
    res.json({
      success: true,
      message: 'Service retrieved successfully.',
      data: service,
    } as ApiResponse);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
};

// Create new service (Admin only)
export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, baseFee, imageUrl } = req.body;
    
    const service = new Service({
      name,
      description,
      baseFee,
      imageUrl,
    });
    
    await service.save();
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully.',
      data: service,
    } as ApiResponse);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
};

// Update service (Admin only)
export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const service = await Service.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found.',
      } as ApiResponse);
      return;
    }
    
    res.json({
      success: true,
      message: 'Service updated successfully.',
      data: service,
    } as ApiResponse);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
};

// Delete service (Admin only)
export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    
    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found.',
      } as ApiResponse);
      return;
    }
    
    res.json({
      success: true,
      message: 'Service deleted successfully.',
    } as ApiResponse);
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    } as ApiResponse);
  }
}; 