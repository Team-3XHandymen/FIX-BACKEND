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
exports.ProviderPrivateData = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const providerPrivateDataSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    nic: {
        type: String,
        required: true,
        trim: true,
    },
    contactNumber: {
        type: String,
        required: true,
        trim: true,
    },
    emailAddress: {
        type: String,
        required: true,
        trim: true,
    },
    personalPhoto: {
        type: String,
        required: true,
    },
    experience: {
        type: Number,
        required: true,
        min: 0,
    },
    certifications: [{
            type: String,
            trim: true,
        }],
    services: [{
            type: String,
            required: true,
        }],
    location: {
        type: String,
        required: true,
        trim: true,
    },
    coordinates: {
        lat: Number,
        lng: Number,
    },
    address: {
        street: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        zipCode: {
            type: String,
            trim: true,
        },
        coordinates: {
            lat: Number,
            lng: Number,
        },
    },
    availability: {
        workingDays: {
            type: String,
            required: true,
            trim: true,
        },
        workingHours: {
            type: String,
            required: true,
            trim: true,
        },
    },
    paymentMethod: {
        type: String,
        required: true,
        trim: true,
    },
    totalEarnings: {
        type: Number,
        default: 0,
        min: 0,
    },
    upcomingBookings: [{
            type: String,
        }],
    schedule: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    notifications: [{
            title: {
                type: String,
                required: true,
            },
            message: {
                type: String,
                required: true,
            },
            read: {
                type: Boolean,
                default: false,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
    oldBookings: [{
            type: String,
        }],
}, {
    timestamps: true,
});
providerPrivateDataSchema.index({ userId: 1 }, { unique: true, sparse: true });
providerPrivateDataSchema.index({ 'address.city': 1, 'address.state': 1 });
providerPrivateDataSchema.index({ services: 1 });
providerPrivateDataSchema.index({ location: 1 });
exports.ProviderPrivateData = mongoose_1.default.model('ProviderPrivateData', providerPrivateDataSchema);
//# sourceMappingURL=ProviderPrivateData.js.map