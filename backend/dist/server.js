"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const redis_1 = require("redis");
const redis_adapter_1 = require("@socket.io/redis-adapter");
// Routes imports
const authRoutes_1 = __importDefault(require("./routes/auth/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/users/userRoutes"));
const workspaceRoutes_1 = __importDefault(require("./routes/workspace/workspaceRoutes"));
const fileRoutes_1 = __importDefault(require("./routes/files/fileRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/ai/aiRoutes"));
const meetingRoutes_1 = __importDefault(require("./routes/meetings/meetingRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notifications/notificationRoutes"));
// Socket Handler import
const socketHandler_1 = require("./sockets/socketHandler");
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
const PORT = process.env.PORT || 5001;
// MIDDLEWARES
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false, // Turn off to allow loading content/assets dynamically
}));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// REST API ROUTES
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/workspaces', workspaceRoutes_1.default);
app.use('/api/files', fileRoutes_1.default);
app.use('/api/ai', aiRoutes_1.default);
app.use('/api/meetings', meetingRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
// Health Check API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date(),
        redisConnected: !!process.env.REDIS_URL,
        uptime: process.uptime()
    });
});
// Root API Endpoint
app.get('/', (req, res) => {
    res.send('Antigravity Hackathon API server is online.');
});
// Setup Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
exports.io = io;
// REDIS SOCKET ADAPTER OPTIONAL INTEGRATION
const initRedisAdapter = async () => {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        console.log('Redis Connection info not found in .env (REDIS_URL). Falling back to Memory Adapter for Socket.IO...');
        return;
    }
    try {
        const pubClient = (0, redis_1.createClient)({ url: redisUrl });
        const subClient = pubClient.duplicate();
        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
        console.log('Successfully initialized Socket.IO Redis Adapter.');
    }
    catch (error) {
        console.error('Failed to connect to Redis. Falling back to Memory Adapter...', error);
    }
};
// Initialize Everything
const startServer = async () => {
    await initRedisAdapter();
    (0, socketHandler_1.initSocketHandler)(io);
    // Catch-all route page
    app.use((req, res) => {
        res.status(404).json({ message: 'Requested path not found' });
    });
    // Global Express Error Handler
    app.use((err, req, res, next) => {
        console.error('Server Internal Error:', err);
        res.status(err.status || 500).json({
            message: err.message || 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    });
    server.listen(PORT, () => {
        console.log(`🚀 Hackathon API Server running on http://localhost:${PORT}`);
        console.log('Press Ctrl+C to stop');
    });
};
startServer();
