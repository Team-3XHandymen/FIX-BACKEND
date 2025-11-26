"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableServices = exports.getServiceProvidersByServiceId = exports.getAllHandymen = exports.updateHandymanProfile = exports.getHandymanProfileByUserId = exports.getHandymanProfile = exports.registerHandyman = void 0;
const ProviderPrivateData_1 = require("../models/ProviderPrivateData");
const ServiceProvider_1 = require("../models/ServiceProvider");
const Service_1 = require("../models/Service");
const registerHandyman = async (req, res) => {
    try {
        const { clerkUserId, name, nic, contactNumber, emailAddress, personalPhoto, experience, certifications, services, location, availability, paymentMethod } = req.body;
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
            });
            return;
        }
        if (!services || !Array.isArray(services) || services.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Services field is required and must be a non-empty array.',
            });
            return;
        }
        if (!location || location.trim() === '') {
            res.status(400).json({
                success: false,
                message: 'Missing required location field. Please provide your location.',
            });
            return;
        }
        if (!availability.workingDays || !availability.workingHours) {
            if (!availability.workingDays)
                availability.workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            if (!availability.workingHours)
                availability.workingHours = ['9:00 AM - 5:00 PM'];
        }
        const userId = clerkUserId;
        const existingHandymanByUserId = await ServiceProvider_1.ServiceProvider.findOne({ userId });
        if (existingHandymanByUserId) {
            res.status(400).json({
                success: false,
                message: 'A handyman with this user ID is already registered.',
            });
            return;
        }
        const existingHandymanByEmail = await ProviderPrivateData_1.ProviderPrivateData.findOne({ emailAddress });
        const existingHandymanByNIC = await ProviderPrivateData_1.ProviderPrivateData.findOne({ nic });
        if (existingHandymanByEmail) {
            res.status(400).json({
                success: false,
                message: 'A handyman with this email address is already registered.',
            });
            return;
        }
        if (existingHandymanByNIC) {
            res.status(400).json({
                success: false,
                message: 'A handyman with this NIC is already registered.',
            });
            return;
        }
        let serviceIds = [];
        if (services && services.length > 0) {
            const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
            const areAllObjectIds = services.every((service) => isValidObjectId(service));
            if (areAllObjectIds) {
                serviceIds = services;
            }
            else {
                const foundServices = await Service_1.Service.find({
                    name: { $in: services.map((s) => new RegExp(s, 'i')) }
                });
                serviceIds = foundServices.map(service => { var _a; return ((_a = service._id) === null || _a === void 0 ? void 0 : _a.toString()) || ''; });
                if (serviceIds.length === 0) {
                    for (const serviceName of services) {
                        if (serviceName !== 'other') {
                            const newService = new Service_1.Service({
                                name: serviceName,
                                description: `${serviceName} services`,
                                baseFee: 50,
                                imageUrl: '',
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
        serviceIds = serviceIds.filter(id => id !== '');
        if (serviceIds.length === 0) {
            const defaultService = new Service_1.Service({
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
        const coordinates = req.body.coordinates ? {
            lat: req.body.coordinates.lat,
            lng: req.body.coordinates.lng
        } : undefined;
        const handymanPrivateData = new ProviderPrivateData_1.ProviderPrivateData({
            userId,
            name,
            nic,
            contactNumber,
            emailAddress,
            personalPhoto: personalPhoto || '',
            experience,
            certifications: certifications || [],
            services: serviceIds,
            location: location,
            coordinates: coordinates,
            availability: {
                workingDays: availability.workingDays,
                workingHours: availability.workingHours,
            },
            paymentMethod: paymentMethod || 'Cash',
            totalEarnings: 0,
            upcomingBookings: [],
            schedule: {},
            notifications: [],
            oldBookings: [],
        });
        await handymanPrivateData.save();
        const serviceProvider = new ServiceProvider_1.ServiceProvider({
            userId,
            name,
            serviceIds: serviceIds,
            experience: `${experience} years`,
            rating: 0,
            location: location,
            coordinates: coordinates,
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
        });
    }
    catch (error) {
        console.error('Register handyman error:', error);
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors,
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.registerHandyman = registerHandyman;
const getHandymanProfile = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated.',
            });
            return;
        }
        const handymanData = await ProviderPrivateData_1.ProviderPrivateData.findOne({ userId })
            .select('name services experience location availability')
            .lean();
        if (!handymanData) {
            res.status(404).json({
                success: false,
                message: 'Handyman profile not found.',
            });
            return;
        }
        res.json({
            success: true,
            message: 'Handyman profile retrieved successfully.',
            data: handymanData,
        });
    }
    catch (error) {
        console.error('Get handyman profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.getHandymanProfile = getHandymanProfile;
const getHandymanProfileByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID is required.',
            });
            return;
        }
        const handymanData = await ServiceProvider_1.ServiceProvider.findOne({ userId })
            .select('name serviceIds experience location availability')
            .lean();
        if (!handymanData) {
            res.status(404).json({
                success: false,
                message: 'Handyman profile not found.',
            });
            return;
        }
        res.json({
            success: true,
            message: 'Handyman profile retrieved successfully.',
            data: handymanData,
        });
    }
    catch (error) {
        console.error('Get handyman profile by userId error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.getHandymanProfileByUserId = getHandymanProfileByUserId;
const updateHandymanProfile = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const updates = req.body;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated.',
            });
            return;
        }
        const handymanData = await ProviderPrivateData_1.ProviderPrivateData.findOneAndUpdate({ userId }, updates, { new: true, runValidators: true });
        if (!handymanData) {
            res.status(404).json({
                success: false,
                message: 'Handyman profile not found.',
            });
            return;
        }
        if (updates.services || updates.experience || updates.location || updates.coordinates) {
            const serviceProviderUpdates = {};
            if (updates.services)
                serviceProviderUpdates.serviceIds = updates.services;
            if (updates.experience)
                serviceProviderUpdates.experience = `${updates.experience} years`;
            if (updates.location) {
                serviceProviderUpdates.location = updates.location;
            }
            if (updates.coordinates) {
                serviceProviderUpdates.coordinates = updates.coordinates;
            }
            await ServiceProvider_1.ServiceProvider.findOneAndUpdate({ userId }, serviceProviderUpdates, { new: true, runValidators: true });
        }
        res.json({
            success: true,
            message: 'Handyman profile updated successfully.',
            data: handymanData,
        });
    }
    catch (error) {
        console.error('Update handyman profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.updateHandymanProfile = updateHandymanProfile;
const getAllHandymen = async (req, res) => {
    try {
        const handymen = await ProviderPrivateData_1.ProviderPrivateData.find()
            .select('name services experience location availability')
            .sort({ createdAt: -1 });
        const handymenWithServiceNames = await Promise.all(handymen.map(async (handyman) => {
            const serviceNames = [];
            if (handyman.services && handyman.services.length > 0) {
                const foundServices = await Service_1.Service.find({ _id: { $in: handyman.services } });
                serviceNames.push(...foundServices.map(service => service.name));
            }
            return Object.assign(Object.assign({}, handyman), { services: serviceNames });
        }));
        res.json({
            success: true,
            message: 'Handymen retrieved successfully.',
            data: handymenWithServiceNames,
        });
    }
    catch (error) {
        console.error('Get all handymen error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.getAllHandymen = getAllHandymen;
const getServiceProvidersByServiceId = async (req, res) => {
    try {
        const { serviceId } = req.params;
        if (!serviceId) {
            res.status(400).json({
                success: false,
                message: 'Service ID is required.',
            });
            return;
        }
        const serviceProviders = await ServiceProvider_1.ServiceProvider.find({
            serviceIds: serviceId
        });
        if (!serviceProviders.length) {
            res.json({
                success: true,
                message: 'No service providers found for this service.',
                data: [],
            });
            return;
        }
        const userIds = serviceProviders.map(provider => provider.userId);
        const providerPrivateData = await ProviderPrivateData_1.ProviderPrivateData.find({
            userId: { $in: userIds }
        });
        const allServices = await Service_1.Service.find({}, '_id name');
        const serviceMap = new Map(allServices.map(service => [service._id.toString(), service.name]));
        const combinedProviders = serviceProviders.map(provider => {
            const serviceNames = provider.serviceIds
                .map(serviceId => serviceMap.get(serviceId.toString()))
                .filter(Boolean);
            const result = {
                _id: provider._id,
                userId: provider.userId,
                name: provider.name,
                status: "Available Now",
                title: serviceNames.join(', ') || provider.bio,
                rating: provider.rating,
                reviews: Math.floor(Math.random() * 200) + 50,
                jobsCompleted: provider.doneJobsCount,
                yearsExp: parseInt(provider.experience.replace(/\D/g, '')) || 0,
                distance: (Math.random() * 5 + 1).toFixed(1),
                services: serviceNames,
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
        });
    }
    catch (error) {
        console.error('Get service providers by service ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.getServiceProvidersByServiceId = getServiceProvidersByServiceId;
const getAvailableServices = async (req, res) => {
    try {
        const services = await Service_1.Service.find({}, '_id name description baseFee imageUrl');
        res.json({
            success: true,
            message: 'Available services retrieved successfully.',
            data: services,
        });
    }
    catch (error) {
        console.error('Get available services error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.getAvailableServices = getAvailableServices;
//# sourceMappingURL=handymanController.js.map