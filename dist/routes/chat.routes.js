"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatController_1 = require("../controllers/chatController");
const router = express_1.default.Router();
router.get('/:bookingId/messages', chatController_1.getChatMessages);
router.post('/send', chatController_1.sendMessage);
router.get('/user', chatController_1.getUserChats);
router.post('/:bookingId/mark-read', chatController_1.markMessagesAsRead);
exports.default = router;
//# sourceMappingURL=chat.routes.js.map