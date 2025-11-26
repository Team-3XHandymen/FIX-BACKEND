"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const clientController_1 = require("../controllers/clientController");
const router = express_1.default.Router();
router.use((req, res, next) => {
    console.log(`📥 Client API Request: ${req.method} ${req.path}`);
    next();
});
router.post('/', clientController_1.createClient);
router.get('/', clientController_1.getAllClients);
router.get('/:userId', clientController_1.getClientByUserId);
router.put('/:userId', clientController_1.updateClientProfile);
exports.default = router;
//# sourceMappingURL=clients.routes.js.map