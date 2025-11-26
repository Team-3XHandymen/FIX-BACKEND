"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handymanController_1 = require("../controllers/handymanController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/register', handymanController_1.registerHandyman);
router.get('/services', handymanController_1.getAvailableServices);
router.get('/profile/:userId', handymanController_1.getHandymanProfileByUserId);
router.get('/profile', auth_1.auth, handymanController_1.getHandymanProfile);
router.put('/profile', auth_1.auth, handymanController_1.updateHandymanProfile);
router.get('/all', auth_1.auth, auth_1.requireProvider, handymanController_1.getAllHandymen);
router.get('/service/:serviceId', handymanController_1.getServiceProvidersByServiceId);
exports.default = router;
//# sourceMappingURL=handyman.routes.js.map