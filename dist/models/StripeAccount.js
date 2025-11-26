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
exports.StripeAccount = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const stripeAccountSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
    },
    accountId: {
        type: String,
        required: true,
    },
    accountType: {
        type: String,
        enum: ['express', 'standard', 'custom'],
        required: true,
    },
    country: {
        type: String,
        required: true,
        length: 2,
    },
    chargesEnabled: {
        type: Boolean,
        default: false,
    },
    payoutsEnabled: {
        type: Boolean,
        default: false,
    },
    detailsSubmitted: {
        type: Boolean,
        default: false,
    },
    requirements: {
        currentlyDue: [String],
        eventuallyDue: [String],
        pastDue: [String],
        pendingVerification: [String],
        disabledReason: String,
    },
    capabilities: {
        cardPayments: {
            type: Boolean,
            default: false,
        },
        transfers: {
            type: Boolean,
            default: false,
        },
    },
    businessProfile: {
        name: String,
        url: String,
        supportEmail: String,
        supportPhone: String,
    },
    settings: {
        payouts: {
            schedule: {
                interval: {
                    type: String,
                    enum: ['daily', 'weekly', 'monthly'],
                },
                weeklyAnchor: {
                    type: String,
                    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                },
                monthlyAnchor: Number,
            },
        },
    },
}, {
    timestamps: true,
});
stripeAccountSchema.index({ userId: 1 }, { unique: true });
stripeAccountSchema.index({ accountId: 1 }, { unique: true });
stripeAccountSchema.index({ chargesEnabled: 1, payoutsEnabled: 1 });
exports.StripeAccount = mongoose_1.default.model('StripeAccount', stripeAccountSchema);
//# sourceMappingURL=StripeAccount.js.map