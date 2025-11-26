"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllClients = exports.updateClientProfile = exports.getClientByUserId = exports.createClient = void 0;
const Client_1 = require("../models/Client");
const createClient = async (req, res) => {
    try {
        const { userId, username, email } = req.body;
        if (!userId || !username || !email) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, username, and email are required.',
                missingFields: {
                    userId: !userId,
                    username: !username,
                    email: !email,
                }
            });
            return;
        }
        const existingClient = await Client_1.Client.findOne({ userId });
        if (existingClient) {
            res.status(409).json({
                success: false,
                message: 'Client already exists with this userId.',
                data: existingClient,
            });
            return;
        }
        const newClient = new Client_1.Client({
            userId,
            username,
            email,
        });
        await newClient.save();
        res.status(201).json({
            success: true,
            message: 'Client created successfully.',
            data: newClient,
        });
    }
    catch (error) {
        console.error('Create client error:', error);
        if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
            const mongoError = error;
            const field = mongoError.keyPattern ? Object.keys(mongoError.keyPattern)[0] : 'unknown';
            if (field === 'userId') {
                res.status(409).json({
                    success: false,
                    message: 'Client already exists with this userId.',
                });
            }
            else {
                res.status(409).json({
                    success: false,
                    message: `${field} already exists.`,
                });
            }
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.createClient = createClient;
const getClientByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const client = await Client_1.Client.findOne({ userId });
        if (!client) {
            res.status(404).json({
                success: false,
                message: 'Client not found.',
            });
            return;
        }
        res.json({
            success: true,
            message: 'Client retrieved successfully.',
            data: client,
        });
    }
    catch (error) {
        console.error('Get client error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.getClientByUserId = getClientByUserId;
const updateClientProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;
        delete updates.userId;
        delete updates.username;
        delete updates.email;
        delete updates.createdAt;
        delete updates.updatedAt;
        const setOps = {};
        const unsetOps = {};
        for (const [key, val] of Object.entries(updates)) {
            if (key === 'location') {
                if (typeof val === 'string' && val.trim() === '') {
                    setOps.location = '';
                    unsetOps.coordinates = 1;
                }
                else {
                    setOps.location = val;
                }
                continue;
            }
            if (key === 'coordinates') {
                if (val && typeof val === 'object') {
                    setOps.coordinates = val;
                }
                else {
                    unsetOps.coordinates = 1;
                }
                continue;
            }
            setOps[key] = val;
        }
        const mongoUpdate = {};
        if (Object.keys(setOps).length)
            mongoUpdate.$set = setOps;
        if (Object.keys(unsetOps).length)
            mongoUpdate.$unset = unsetOps;
        const client = await Client_1.Client.findOneAndUpdate({ userId }, mongoUpdate, { new: true, runValidators: true });
        if (!client) {
            res.status(404).json({
                success: false,
                message: 'Client not found.',
            });
            return;
        }
        res.json({
            success: true,
            message: 'Client profile updated successfully.',
            data: client,
        });
    }
    catch (error) {
        console.error('Update client profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.updateClientProfile = updateClientProfile;
const getAllClients = async (req, res) => {
    try {
        const clients = await Client_1.Client.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            message: 'Clients retrieved successfully.',
            data: clients,
        });
    }
    catch (error) {
        console.error('Get all clients error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.getAllClients = getAllClients;
//# sourceMappingURL=clientController.js.map