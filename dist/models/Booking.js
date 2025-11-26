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
exports.Booking = void 0;
var mongoose_1 = __importStar(require("mongoose"));
var bookingSchema = new mongoose_1.Schema({
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'paid', 'done', 'completed'],
        default: 'pending',
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    fee: {
        type: Number,
        default: null,
        min: 0,
    },
    location: {
        address: {
            type: String,
            required: true,
            trim: true,
        },
        coordinates: {
            lat: Number,
            lng: Number,
        },
    },
    clientId: {
        type: String,
        required: true,
    },
    providerId: {
        type: String,
        required: true,
    },
    serviceId: {
        type: String,
        required: true,
    },
    clientName: {
        type: String,
    },
    providerName: {
        type: String,
        required: true,
    },
    serviceName: {
        type: String,
        required: true,
    },
    scheduledTime: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    statusChangeHistory: [{
            status: String,
            changedAt: { type: Date, default: Date.now },
            changedBy: {
                type: String,
                enum: ['client', 'provider'],
            },
        }],
}, {
    timestamps: true,
});
// 🔽 Indexes (clean, non-duplicated)
bookingSchema.index({ clientId: 1, status: 1 }); // For client-based booking queries
bookingSchema.index({ providerId: 1, status: 1 }); // For provider-based booking queries
bookingSchema.index({ serviceId: 1 }); // For filtering by service
bookingSchema.index({ status: 1 }); // For filtering by booking status
bookingSchema.index({ scheduledTime: 1 }); // For filtering or sorting by date/time
exports.Booking = mongoose_1.default.model('Booking', bookingSchema);
