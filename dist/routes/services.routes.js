"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const serviceController_1 = require("../controllers/serviceController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', serviceController_1.getAllServices);
router.get('/:id', serviceController_1.getServiceById);
router.post('/', auth_1.auth, auth_1.requireProvider, serviceController_1.createService);
router.put('/:id', auth_1.auth, auth_1.requireProvider, serviceController_1.updateService);
router.delete('/:id', auth_1.auth, auth_1.requireProvider, serviceController_1.deleteService);
exports.default = router;
//# sourceMappingURL=services.routes.js.map