"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatusClient = exports.updateBookingStatusPublic = exports.getBookingsByProviderDatabaseId = exports.getBookingsByClerkUserId = exports.getBookingsByProviderId = exports.getPendingBookings = exports.updateBooking = exports.getBookingById = exports.getMyBookings = exports.createBooking = void 0;
const Booking_1 = require("../models/Booking");
const ServiceProvider_1 = require("../models/ServiceProvider");
const ProviderPrivateData_1 = require("../models/ProviderPrivateData");
const createBooking = async (req, res) => {
    try {
        const { description, location, providerId, serviceId, scheduledTime } = req.body;
        const clientId = req.user.id;
        const { Client } = await Promise.resolve().then(() => __importStar(require('../models/Client')));
        const client = await Client.findOne({ userId: clientId });
        const clientName = (client === null || client === void 0 ? void 0 : client.name) || (client === null || client === void 0 ? void 0 : client.username) || 'Client';
        const provider = await ServiceProvider_1.ServiceProvider.findOne({ userId: providerId });
        if (!provider) {
            res.status(404).json({
                success: false,
                message: 'Service provider not found.',
            });
            return;
        }
        if (!provider.serviceIds.includes(serviceId)) {
            res.status(400).json({
                success: false,
                message: 'Provider does not offer this service.',
            });
            return;
        }
        const { Service } = await Promise.resolve().then(() => __importStar(require('../models/Service')));
        const service = await Service.findById(serviceId);
        if (!service) {
            res.status(404).json({
                success: false,
                message: 'Service not found.',
            });
            return;
        }
        const booking = new Booking_1.Booking({
            description,
            location,
            clientId,
            providerId,
            serviceId,
            clientName,
            providerName: provider.name,
            serviceName: service.name,
            scheduledTime: new Date(scheduledTime),
            status: 'pending',
            fee: null,
            statusChangeHistory: [{
                    status: 'pending',
                    changedAt: new Date(),
                    changedBy: 'client',
                }],
        });
        await booking.save();
        res.status(201).json({
            success: true,
            message: 'Booking created successfully.',
            data: booking,
        });
    }
    catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.createBooking = createBooking;
const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const userType = req.user.type;
        console.log('Getting bookings for user:', { userId, userType });
        let query = {};
        if (userType === 'client') {
            query.clientId = userId;
        }
        else if (userType === 'provider') {
            query.providerId = userId;
        }
        const bookings = await Booking_1.Booking.find(query)
            .sort({ scheduledTime: -1 });
        console.log(`Found ${bookings.length} bookings`);
        const enrichedBookings = bookings.map(booking => {
            console.log('Raw booking fields:', Object.keys(booking.toObject()));
            console.log('Booking serviceName:', booking.serviceName);
            console.log('Booking providerName:', booking.providerName);
            return Object.assign(Object.assign({}, booking.toObject()), { providerName: booking.providerName, serviceCategory: booking.serviceName });
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
        });
    }
    catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.getMyBookings = getMyBookings;
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const booking = await Booking_1.Booking.findById(id);
        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'Booking not found.',
            });
            return;
        }
        if (booking.clientId !== userId && booking.providerId !== userId) {
            res.status(403).json({
                success: false,
                message: 'Access denied.',
            });
            return;
        }
        res.json({
            success: true,
            message: 'Booking retrieved successfully.',
            data: booking,
        });
    }
    catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.getBookingById = getBookingById;
const updateBooking = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const { status, fee, description } = req.body;
        const userId = req.user.id;
        const userType = req.user.type;
        const booking = await Booking_1.Booking.findById(id);
        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'Booking not found.',
            });
            return;
        }
        if (userType === 'client' && booking.clientId !== userId) {
            res.status(403).json({
                success: false,
                message: 'Access denied.',
            });
            return;
        }
        if (userType === 'provider' && booking.providerId !== userId) {
            res.status(403).json({
                success: false,
                message: 'Access denied.',
            });
            return;
        }
        const updates = {};
        if (status)
            updates.status = status;
        if (fee !== undefined)
            updates.fee = fee;
        if (description)
            updates.description = description;
        const updatedBooking = await Booking_1.Booking.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (status === 'done' && userType === 'provider') {
            await updateProviderStats(userId, ((_a = booking._id) === null || _a === void 0 ? void 0 : _a.toString()) || '', fee || 0);
        }
        res.json({
            success: true,
            message: 'Booking updated successfully.',
            data: updatedBooking,
        });
    }
    catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.updateBooking = updateBooking;
const updateProviderStats = async (providerId, bookingId, fee) => {
    try {
        await ServiceProvider_1.ServiceProvider.findOneAndUpdate({ userId: providerId }, { $inc: { doneJobsCount: 1 } });
        await ProviderPrivateData_1.ProviderPrivateData.findOneAndUpdate({ userId: providerId }, {
            $inc: { totalEarnings: fee },
            $push: { oldBookings: bookingId },
            $pull: { upcomingBookings: bookingId }
        }, { upsert: true });
    }
    catch (error) {
        console.error('Error updating provider stats:', error);
    }
};
const getPendingBookings = async (req, res) => {
    try {
        const providerId = req.user.id;
        const bookings = await Booking_1.Booking.find({
            providerId,
            status: 'pending'
        })
            .sort({ scheduledTime: 1 })
            .populate('serviceId', 'name baseFee');
        res.json({
            success: true,
            message: 'Pending bookings retrieved successfully.',
            data: bookings,
        });
    }
    catch (error) {
        console.error('Get pending bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.getPendingBookings = getPendingBookings;
const getBookingsByProviderId = async (req, res) => {
    try {
        const { providerId } = req.params;
        const provider = await ServiceProvider_1.ServiceProvider.findOne({ userId: providerId });
        if (!provider) {
            res.status(404).json({
                success: false,
                message: 'Service provider not found.',
            });
            return;
        }
        const { Client } = await Promise.resolve().then(() => __importStar(require('../models/Client')));
        const bookings = await Booking_1.Booking.find({ providerId })
            .sort({ createdAt: -1 });
        const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
            const client = await Client.findOne({ userId: booking.clientId });
            return Object.assign(Object.assign({}, booking.toObject()), { clientName: (client === null || client === void 0 ? void 0 : client.name) || (client === null || client === void 0 ? void 0 : client.username) || 'Unknown Client' });
        }));
        res.json({
            success: true,
            message: 'Provider bookings retrieved successfully.',
            data: enrichedBookings,
        });
    }
    catch (error) {
        console.error('Get bookings by provider ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.getBookingsByProviderId = getBookingsByProviderId;
const getBookingsByClerkUserId = async (req, res) => {
    try {
        const { clerkUserId } = req.params;
        const { Client } = await Promise.resolve().then(() => __importStar(require('../models/Client')));
        const bookings = await Booking_1.Booking.find({ providerId: clerkUserId })
            .sort({ createdAt: -1 });
        const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
            const client = await Client.findOne({ userId: booking.clientId });
            return Object.assign(Object.assign({}, booking.toObject()), { clientName: (client === null || client === void 0 ? void 0 : client.name) || (client === null || client === void 0 ? void 0 : client.username) || 'Unknown Client' });
        }));
        res.json({
            success: true,
            message: 'Provider bookings retrieved successfully.',
            data: enrichedBookings,
        });
    }
    catch (error) {
        console.error('Get bookings by Clerk user ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.getBookingsByClerkUserId = getBookingsByClerkUserId;
const getBookingsByProviderDatabaseId = async (req, res) => {
    try {
        const { providerDatabaseId } = req.params;
        const { Client } = await Promise.resolve().then(() => __importStar(require('../models/Client')));
        const bookings = await Booking_1.Booking.find({ providerId: providerDatabaseId })
            .sort({ createdAt: -1 });
        const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
            const client = await Client.findOne({ userId: booking.clientId });
            return Object.assign(Object.assign({}, booking.toObject()), { clientName: (client === null || client === void 0 ? void 0 : client.name) || (client === null || client === void 0 ? void 0 : client.username) || 'Unknown Client' });
        }));
        res.json({
            success: true,
            message: 'Provider bookings retrieved successfully.',
            data: enrichedBookings,
        });
    }
    catch (error) {
        console.error('Get bookings by provider database ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.getBookingsByProviderDatabaseId = getBookingsByProviderDatabaseId;
const updateBookingStatusPublic = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, fee, clerkUserId } = req.body;
        if (!status || !['accepted', 'rejected', 'paid', 'done', 'completed'].includes(status)) {
            res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: "accepted", "rejected", "paid", "done", "completed".',
            });
            return;
        }
        if (!clerkUserId) {
            res.status(400).json({
                success: false,
                message: 'Clerk user ID is required to verify ownership.',
            });
            return;
        }
        const booking = await Booking_1.Booking.findById(id);
        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'Booking not found.',
            });
            return;
        }
        if (booking.providerId !== clerkUserId) {
            res.status(403).json({
                success: false,
                message: 'Access denied. You can only update your own bookings.',
            });
            return;
        }
        let isValidTransition = false;
        let requiredFee = false;
        switch (booking.status) {
            case 'pending':
                if (['accepted', 'rejected'].includes(status)) {
                    isValidTransition = true;
                    if (status === 'accepted') {
                        requiredFee = true;
                    }
                }
                break;
            case 'accepted':
                if (status === 'paid') {
                    isValidTransition = true;
                }
                break;
            case 'paid':
                if (status === 'done') {
                    isValidTransition = true;
                }
                break;
            case 'done':
                if (status === 'completed') {
                    isValidTransition = true;
                }
                break;
            case 'rejected':
                isValidTransition = false;
                break;
            case 'completed':
                isValidTransition = false;
                break;
        }
        if (!isValidTransition) {
            res.status(400).json({
                success: false,
                message: `Invalid status transition from "${booking.status}" to "${status}".`,
            });
            return;
        }
        if (requiredFee && (!fee || fee <= 0)) {
            res.status(400).json({
                success: false,
                message: 'Fee is required and must be greater than 0 when accepting a booking.',
            });
            return;
        }
        const updates = { status };
        if (fee !== undefined)
            updates.fee = fee;
        if (booking.status !== status) {
            updates.$push = {
                statusChangeHistory: {
                    status: status,
                    changedAt: new Date(),
                    changedBy: 'provider',
                },
            };
        }
        const updatedBooking = await Booking_1.Booking.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        res.json({
            success: true,
            message: `Booking ${status} successfully.`,
            data: updatedBooking,
        });
    }
    catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.updateBookingStatusPublic = updateBookingStatusPublic;
const updateBookingStatusClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, clerkUserId } = req.body;
        if (!status || !['paid', 'completed'].includes(status)) {
            res.status(400).json({
                success: false,
                message: 'Invalid status. Must be either "paid" or "completed".',
            });
            return;
        }
        if (!clerkUserId) {
            res.status(400).json({
                success: false,
                message: 'Clerk user ID is required to verify ownership.',
            });
            return;
        }
        const booking = await Booking_1.Booking.findById(id);
        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'Booking not found.',
            });
            return;
        }
        if (booking.clientId !== clerkUserId) {
            res.status(403).json({
                success: false,
                message: 'Access denied. You can only update your own bookings.',
            });
            return;
        }
        let isValidTransition = false;
        switch (booking.status) {
            case 'accepted':
                if (status === 'paid') {
                    isValidTransition = true;
                }
                break;
            case 'done':
                if (status === 'completed') {
                    isValidTransition = true;
                }
                break;
            default:
                isValidTransition = false;
        }
        if (!isValidTransition) {
            res.status(400).json({
                success: false,
                message: `Invalid status transition from "${booking.status}" to "${status}".`,
            });
            return;
        }
        const updates = { status };
        if (booking.status !== status) {
            updates.$push = {
                statusChangeHistory: {
                    status: status,
                    changedAt: new Date(),
                    changedBy: 'client',
                },
            };
        }
        const updatedBooking = await Booking_1.Booking.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        res.json({
            success: true,
            message: `Booking ${status} successfully.`,
            data: updatedBooking,
        });
    }
    catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.updateBookingStatusClient = updateBookingStatusClient;
//# sourceMappingURL=bookingController.js.map