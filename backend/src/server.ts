import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

// Routes imports
import authRoutes from './routes/auth/authRoutes';
import userRoutes from './routes/users/userRoutes';
import workspaceRoutes from './routes/workspace/workspaceRoutes';
import fileRoutes from './routes/files/fileRoutes';
import aiRoutes from './routes/ai/aiRoutes';
import meetingRoutes from './routes/meetings/meetingRoutes';
import notificationRoutes from './routes/notifications/notificationRoutes';

// Socket Handler import
import { initSocketHandler } from './sockets/socketHandler';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

// MIDDLEWARES
app.use(helmet({
  crossOriginResourcePolicy: false, // Turn off to allow loading content/assets dynamically
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// REST API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/notifications', notificationRoutes);

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
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// REDIS SOCKET ADAPTER OPTIONAL INTEGRATION
const initRedisAdapter = async () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log('Redis Connection info not found in .env (REDIS_URL). Falling back to Memory Adapter for Socket.IO...');
    return;
  }

  try {
    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    console.log('Successfully initialized Socket.IO Redis Adapter.');
  } catch (error) {
    console.error('Failed to connect to Redis. Falling back to Memory Adapter...', error);
  }
};

// Initialize Everything
const startServer = async () => {
  await initRedisAdapter();
  initSocketHandler(io);

  // Catch-all route page
  app.use((req, res) => {
    res.status(404).json({ message: 'Requested path not found' });
  });

  // Global Express Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
export { app, server, io };
