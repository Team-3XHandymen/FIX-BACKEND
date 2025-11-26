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
exports.Payment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const paymentSchema = new mongoose_1.Schema({
    bookingId: {
        type: String,
        required: true,
    },
    paymentIntentId: {
        type: String,
        required: true,
    },
    sessionId: {
        type: String,
    },
    amountCents: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        required: true,
        default: 'usd',
        length: 3,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded'],
        default: 'pending',
    },
    applicationFeeCents: {
        type: Number,
        required: true,
        min: 0,
    },
    providerAccountId: {
        type: String,
        required: true,
    },
    clientId: {
        type: String,
        required: true,
    },
    providerId: {
        type: String,
        required: true,
    },
    metadata: {
        bookingId: String,
        serviceName: String,
        providerName: String,
        clientName: String,
    },
    refunds: [{
            refundId: {
                type: String,
                required: true,
            },
            amountCents: {
                type: Number,
                required: true,
                min: 0,
            },
            reason: String,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
}, {
    timestamps: true,
});
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ paymentIntentId: 1 }, { unique: true });
paymentSchema.index({ sessionId: 1 }, { sparse: true });
paymentSchema.index({ clientId: 1, status: 1 });
paymentSchema.index({ providerId: 1, status: 1 });
paymentSchema.index({ providerAccountId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });
exports.Payment = mongoose_1.default.model('Payment', paymentSchema);
//# sourceMappingURL=Payment.js.map