"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stripeController_1 = require("../controllers/stripeController");
const stripeWebhookController_1 = require("../controllers/stripeWebhookController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), stripeWebhookController_1.StripeWebhookController.handleWebhook);
router.use(auth_1.auth);
router.post('/create-provider-account', stripeController_1.StripeController.createProviderAccount);
router.get('/provider-account/:userId', stripeController_1.StripeController.getProviderAccountStatus);
router.post('/create-checkout-session', stripeController_1.StripeController.createCheckoutSession);
router.get('/payment/booking/:bookingId', stripeController_1.StripeController.getPaymentByBookingId);
router.get('/payments/my', stripeController_1.StripeController.getPaymentsByProvider);
router.post('/create-manual-payment', stripeController_1.StripeController.createManualPayment);
router.post('/refund/:paymentId', auth_1.requireProvider, stripeController_1.StripeController.createRefund);
exports.default = router;
//# sourceMappingURL=stripe.routes.js.map