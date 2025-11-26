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
exports.ServiceProvider = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const serviceProviderSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    serviceIds: [{
            type: String,
            required: true,
        }],
    experience: {
        type: String,
        required: true,
        trim: true,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    coordinates: {
        lat: Number,
        lng: Number,
    },
    bio: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
    },
    doneJobsCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    availability: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,
});
serviceProviderSchema.index({ userId: 1 }, { unique: true });
serviceProviderSchema.index({ serviceIds: 1 });
serviceProviderSchema.index({ rating: -1 });
serviceProviderSchema.index({ location: 1 });
exports.ServiceProvider = mongoose_1.default.model('ServiceProvider', serviceProviderSchema);
//# sourceMappingURL=ServiceProvider.js.map