"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const Client_1 = require("../models/Client");
const ServiceProvider_1 = require("../models/ServiceProvider");
class WebhookController {
    static async handleClerkWebhook(req, res) {
        try {
            const { type, data, object } = req.body;
            console.log('📨 Received Clerk webhook:', { type, object, userId: data === null || data === void 0 ? void 0 : data.id });
            if (object !== 'user') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid webhook object type'
                });
            }
            switch (type) {
                case 'user.created':
                    await this.handleUserCreated(data);
                    break;
                case 'user.updated':
                    await this.handleUserUpdated(data);
                    break;
                case 'user.deleted':
                    await this.handleUserDeleted(data);
                    break;
                default:
                    console.log(`⚠️ Unhandled webhook type: ${type}`);
            }
            res.status(200).json({
                success: true,
                message: 'Webhook processed successfully'
            });
        }
        catch (error) {
            console.error('❌ Webhook processing error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process webhook',
                error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : 'Internal server error'
            });
        }
    }
    static async handleUserCreated(userData) {
        var _a, _b, _c, _d;
        try {
            console.log('👤 Processing user.created webhook for:', userData.id);
            const email = (_b = (_a = userData.email_addresses) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.email_address;
            const firstName = userData.first_name || '';
            const lastName = userData.last_name || '';
            const username = userData.username || '';
            const phoneNumber = ((_d = (_c = userData.phone_numbers) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.phone_number) || '';
            if (!email) {
                console.warn('⚠️ User created without email:', userData.id);
                return;
            }
            const existingClient = await Client_1.Client.findOne({ userId: userData.id });
            const existingProvider = await ServiceProvider_1.ServiceProvider.findOne({ userId: userData.id });
            if (existingClient || existingProvider) {
                console.log('ℹ️ User already exists in database:', userData.id);
                return;
            }
            const newClient = new Client_1.Client({
                userId: userData.id,
                name: `${firstName} ${lastName}`.trim() || username || 'New User',
                mobileNumber: phoneNumber,
                address: {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: ''
                },
                location: '',
                preferences: {
                    marketingConsent: false
                }
            });
            await newClient.save();
            console.log('✅ Created new client profile for:', userData.id);
        }
        catch (error) {
            console.error('❌ Error handling user.created webhook:', error);
        }
    }
    static async handleUserUpdated(userData) {
        var _a, _b, _c, _d;
        try {
            console.log('🔄 Processing user.updated webhook for:', userData.id);
            const email = (_b = (_a = userData.email_addresses) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.email_address;
            const firstName = userData.first_name || '';
            const lastName = userData.last_name || '';
            const username = userData.username || '';
            const phoneNumber = ((_d = (_c = userData.phone_numbers) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.phone_number) || '';
            const client = await Client_1.Client.findOne({ userId: userData.id });
            if (client) {
                const updates = {};
                if (firstName || lastName) {
                    updates.name = `${firstName} ${lastName}`.trim();
                }
                if (phoneNumber) {
                    updates.mobileNumber = phoneNumber;
                }
                if (Object.keys(updates).length > 0) {
                    await Client_1.Client.findOneAndUpdate({ userId: userData.id }, { $set: updates }, { new: true });
                    console.log('✅ Updated client profile for:', userData.id);
                }
            }
            const provider = await ServiceProvider_1.ServiceProvider.findOne({ userId: userData.id });
            if (provider) {
                const updates = {};
                if (firstName || lastName) {
                    updates.name = `${firstName} ${lastName}`.trim();
                }
                if (phoneNumber) {
                    updates.mobileNumber = phoneNumber;
                }
                if (Object.keys(updates).length > 0) {
                    await ServiceProvider_1.ServiceProvider.findOneAndUpdate({ userId: userData.id }, { $set: updates }, { new: true });
                    console.log('✅ Updated provider profile for:', userData.id);
                }
            }
        }
        catch (error) {
            console.error('❌ Error handling user.updated webhook:', error);
        }
    }
    static async handleUserDeleted(userData) {
        try {
            console.log('🗑️ Processing user.deleted webhook for:', userData.id);
            const deletedClient = await Client_1.Client.findOneAndDelete({ userId: userData.id });
            const deletedProvider = await ServiceProvider_1.ServiceProvider.findOneAndDelete({ userId: userData.id });
            if (deletedClient) {
                console.log('✅ Deleted client profile for:', userData.id);
            }
            if (deletedProvider) {
                console.log('✅ Deleted provider profile for:', userData.id);
            }
            if (!deletedClient && !deletedProvider) {
                console.log('ℹ️ No profile found to delete for:', userData.id);
            }
        }
        catch (error) {
            console.error('❌ Error handling user.deleted webhook:', error);
        }
    }
}
exports.WebhookController = WebhookController;
//# sourceMappingURL=webhookController.js.map