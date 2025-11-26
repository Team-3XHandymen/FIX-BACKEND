"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateService = exports.createService = exports.getServiceById = exports.getAllServices = void 0;
const Service_1 = require("../models/Service");
const getAllServices = async (req, res) => {
    try {
        const services = await Service_1.Service.find().sort({ name: 1 });
        res.json({
            success: true,
            message: 'Services retrieved successfully.',
            data: services,
        });
    }
    catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.getAllServices = getAllServices;
const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service_1.Service.findById(id);
        if (!service) {
            res.status(404).json({
                success: false,
                message: 'Service not found.',
            });
            return;
        }
        res.json({
            success: true,
            message: 'Service retrieved successfully.',
            data: service,
        });
    }
    catch (error) {
        console.error('Get service error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.getServiceById = getServiceById;
const createService = async (req, res) => {
    try {
        const { name, description, baseFee, imageUrl } = req.body;
        const service = new Service_1.Service({
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
        });
    }
    catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.createService = createService;
const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const service = await Service_1.Service.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!service) {
            res.status(404).json({
                success: false,
                message: 'Service not found.',
            });
            return;
        }
        res.json({
            success: true,
            message: 'Service updated successfully.',
            data: service,
        });
    }
    catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.updateService = updateService;
const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service_1.Service.findByIdAndDelete(id);
        if (!service) {
            res.status(404).json({
                success: false,
                message: 'Service not found.',
            });
            return;
        }
        res.json({
            success: true,
            message: 'Service deleted successfully.',
        });
    }
    catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.deleteService = deleteService;
//# sourceMappingURL=serviceController.js.map