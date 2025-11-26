"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookingController_1 = require("../controllers/bookingController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Bookings route is working',
        timestamp: new Date().toISOString()
    });
});
router.get('/provider/:providerId', bookingController_1.getBookingsByProviderId);
router.get('/provider-clerk/:clerkUserId', bookingController_1.getBookingsByClerkUserId);
router.get('/provider-db/:providerDatabaseId', bookingController_1.getBookingsByProviderDatabaseId);
router.patch('/:id/status-public', bookingController_1.updateBookingStatusPublic);
router.patch('/:id/status-client', bookingController_1.updateBookingStatusClient);
router.use(auth_1.auth);
router.post('/', auth_1.requireClient, bookingController_1.createBooking);
router.get('/my', bookingController_1.getMyBookings);
router.get('/pending', auth_1.requireProvider, bookingController_1.getPendingBookings);
router.get('/:id', bookingController_1.getBookingById);
router.put('/:id', bookingController_1.updateBooking);
exports.default = router;
//# sourceMappingURL=bookings.routes.js.map