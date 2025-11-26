"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const services_routes_1 = __importDefault(require("./routes/services.routes"));
const bookings_routes_1 = __importDefault(require("./routes/bookings.routes"));
const handyman_routes_1 = __importDefault(require("./routes/handyman.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const clients_routes_1 = __importDefault(require("./routes/clients.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const stripe_routes_1 = __importDefault(require("./routes/stripe.routes"));
const Chat_1 = require("./models/Chat");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://fixfinder-frontend.netlify.app',
    process.env.FRONTEND_URL || '',
].filter(Boolean);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});
(0, database_1.connectDB)();
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-User-Type'],
}));
app.options('*', (0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-User-Type'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    next();
});
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        cors_origins: allowedOrigins
    });
});
app.use('/api/services', services_routes_1.default);
app.use('/api/bookings', bookings_routes_1.default);
app.use('/api/handyman', handyman_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/clients', clients_routes_1.default);
app.use('/api/chat', chat_routes_1.default);
app.use('/api/stripe', stripe_routes_1.default);
io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);
    socket.on('join_booking_room', (bookingId) => {
        socket.join(`booking_${bookingId}`);
        console.log(`📱 User ${socket.id} joined booking room: ${bookingId}`);
    });
    socket.on('send_message', async (data) => {
        try {
            let chat = await Chat_1.Chat.findOne({ bookingId: data.bookingId });
            if (!chat) {
                chat = new Chat_1.Chat({
                    bookingId: data.bookingId,
                    messages: [],
                });
            }
            const newMessage = {
                senderId: data.senderId,
                senderName: data.senderName,
                message: data.message,
                timestamp: new Date(),
            };
            chat.messages.push(newMessage);
            chat.lastMessageAt = new Date();
            await chat.save();
            console.log(`💾 Message saved to database for booking ${data.bookingId}`);
        }
        catch (error) {
            console.error('❌ Error saving message to database:', error);
        }
        io.to(`booking_${data.bookingId}`).emit('receive_message', Object.assign(Object.assign({}, data), { timestamp: new Date() }));
        console.log(`💬 Message sent in booking ${data.bookingId}: ${data.message}`);
    });
    socket.on('booking_status_update', (data) => {
        io.to(`booking_${data.bookingId}`).emit('booking_status_changed', Object.assign(Object.assign({}, data), { timestamp: new Date() }));
        console.log(`🔄 Booking ${data.bookingId} status updated to: ${data.newStatus}`);
    });
    socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);
    });
});
console.log('🔗 Registered API routes:');
console.log('  - /api/services');
console.log('  - /api/bookings');
console.log('  - /api/handyman');
console.log('  - /api/auth');
console.log('  - /api/clients');
console.log('  - /api/chat');
console.log('  - /api/stripe');
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Handyman App API',
        version: '1.0.0',
    });
});
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});
server.listen(env_1.config.PORT, () => {
    console.log(`🚀 Server is running on port ${env_1.config.PORT}`);
    console.log(`📊 Environment: ${env_1.config.NODE_ENV}`);
    console.log(`🌐 CORS Origin: ${env_1.config.CORS_ORIGIN || 'Not configured'}`);
    console.log(`🔌 WebSocket server is ready`);
});
//# sourceMappingURL=index.js.map