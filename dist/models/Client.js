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
exports.Client = void 0;
var mongoose_1 = __importStar(require("mongoose"));
var clientSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    name: {
        type: String,
        required: false,
        trim: true,
    },
    mobileNumber: {
        type: String,
        required: false,
        trim: true,
    },
    address: {
        street: {
            type: String,
            required: false,
            trim: true,
        },
        city: {
            type: String,
            required: false,
            trim: true,
        },
        state: {
            type: String,
            required: false,
            trim: true,
        },
        zipCode: {
            type: String,
            required: false,
            trim: true,
        },
        coordinates: {
            lat: Number,
            lng: Number,
        },
    },
    location: {
        type: String,
        required: false,
        trim: true,
    },
    coordinates: {
        lat: Number,
        lng: Number,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
    },
    preferences: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,
});
clientSchema.index({ userId: 1 }); // Unique index for Clerk user ID only
clientSchema.index({ email: 1 }); // Index for email lookups (not unique)
clientSchema.index({ username: 1 }); // Index for username lookups (not unique)
clientSchema.index({ 'address.city': 1, 'address.state': 1 }); // For filtering by city/state
clientSchema.index({ location: 1 }); // For general region filtering
exports.Client = mongoose_1.default.model('Client', clientSchema);
