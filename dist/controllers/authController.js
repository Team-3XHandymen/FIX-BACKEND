"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserRole = exports.AuthController = void 0;
const Client_1 = require("../models/Client");
const ServiceProvider_1 = require("../models/ServiceProvider");
const ProviderPrivateData_1 = require("../models/ProviderPrivateData");
class AuthController {
    static async createUser(req, res) {
        try {
            const { clerkUserId, userType, userData } = req.body;
            if (!clerkUserId || !userType || !userData) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: clerkUserId, userType, and userData are required'
                });
            }
            if (!userData.username || !userData.fullName || !userData.mobileNumber || !userData.email) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required user data: username, fullName, mobileNumber, and email are required'
                });
            }
            let existingUser;
            if (userType === 'client') {
                existingUser = await Client_1.Client.findOne({ userId: clerkUserId });
            }
            else {
                existingUser = await ServiceProvider_1.ServiceProvider.findOne({ userId: clerkUserId });
            }
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'User already exists in the database'
                });
            }
            let newUser;
            if (userType === 'client') {
                newUser = new Client_1.Client({
                    userId: clerkUserId,
                    name: userData.fullName,
                    mobileNumber: userData.mobileNumber,
                    address: userData.address || {
                        street: '',
                        city: '',
                        state: '',
                        zipCode: ''
                    },
                    location: userData.location || '',
                    preferences: {
                        marketingConsent: userData.acceptMarketing || false
                    }
                });
                await newUser.save();
            }
            else {
                newUser = new ServiceProvider_1.ServiceProvider({
                    userId: clerkUserId,
                    name: userData.fullName,
                    mobileNumber: userData.mobileNumber,
                    email: userData.email,
                    address: userData.address || {
                        street: '',
                        city: '',
                        state: '',
                        zipCode: ''
                    },
                    location: userData.location || '',
                    services: [],
                    rating: 0,
                    isVerified: false,
                    isActive: true
                });
                await newUser.save();
            }
            res.status(201).json({
                success: true,
                message: `${userType} created successfully`,
                data: {
                    userId: newUser.userId,
                    userType,
                    name: newUser.name,
                    email: userData.email
                }
            });
        }
        catch (error) {
            console.error('Error creating user:', error);
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: 'User already exists with this information'
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to create user',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
    static async getUserProfile(req, res) {
        try {
            const { clerkUserId, userType } = req.params;
            if (!clerkUserId || !userType) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required parameters: clerkUserId and userType'
                });
            }
            let user;
            if (userType === 'client') {
                user = await Client_1.Client.findOne({ userId: clerkUserId });
            }
            else if (userType === 'handyman') {
                user = await ServiceProvider_1.ServiceProvider.findOne({ userId: clerkUserId });
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid user type. Must be either "client" or "handyman"'
                });
            }
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            res.status(200).json({
                success: true,
                data: user
            });
        }
        catch (error) {
            console.error('Error fetching user profile:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user profile',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
    static async updateUserProfile(req, res) {
        try {
            const { clerkUserId, userType } = req.params;
            const updateData = req.body;
            if (!clerkUserId || !userType) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required parameters: clerkUserId and userType'
                });
            }
            let user;
            if (userType === 'client') {
                user = await Client_1.Client.findOneAndUpdate({ userId: clerkUserId }, { $set: updateData }, { new: true, runValidators: true });
            }
            else if (userType === 'handyman') {
                user = await ServiceProvider_1.ServiceProvider.findOneAndUpdate({ userId: clerkUserId }, { $set: updateData }, { new: true, runValidators: true });
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid user type. Must be either "client" or "handyman"'
                });
            }
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: user
            });
        }
        catch (error) {
            console.error('Error updating user profile:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user profile',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
    static async deleteUser(req, res) {
        try {
            const { clerkUserId, userType } = req.params;
            if (!clerkUserId || !userType) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required parameters: clerkUserId and userType'
                });
            }
            let deletedUser;
            if (userType === 'client') {
                deletedUser = await Client_1.Client.findOneAndDelete({ userId: clerkUserId });
            }
            else if (userType === 'handyman') {
                deletedUser = await ServiceProvider_1.ServiceProvider.findOneAndDelete({ userId: clerkUserId });
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid user type. Must be either "client" or "handyman"'
                });
            }
            if (!deletedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            res.status(200).json({
                success: true,
                message: 'User account deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete user account',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
    static async verifyUserRole(req, res) {
        try {
            const { userId } = req.params;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required parameter: userId'
                });
            }
            const client = await Client_1.Client.findOne({ userId });
            const serviceProvider = await ServiceProvider_1.ServiceProvider.findOne({ userId });
            const providerPrivateData = await ProviderPrivateData_1.ProviderPrivateData.findOne({ userId });
            let userRole = 'none';
            let isRegistered = false;
            if (serviceProvider && providerPrivateData) {
                userRole = 'handyman';
                isRegistered = true;
            }
            else if (client) {
                userRole = 'client';
                isRegistered = true;
            }
            res.status(200).json({
                success: true,
                data: {
                    userId,
                    userRole,
                    isRegistered,
                    hasClientProfile: !!client,
                    hasHandymanProfile: !!(serviceProvider && providerPrivateData)
                }
            });
        }
        catch (error) {
            console.error('Error verifying user role:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to verify user role',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
}
exports.AuthController = AuthController;
exports.verifyUserRole = AuthController.verifyUserRole;
//# sourceMappingURL=authController.js.map