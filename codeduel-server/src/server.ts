import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Redis } from 'ioredis';
import { addToQueue, removeFromQueue, tryMatchmaking } from './matchmaking.js';
import { joinRoom, handleSubmission, handleDisconnect } from './rooms.js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Redis Setup
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (err: any) => {
  console.error('Redis connection error:', err);
});

// HTTP Server & Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_queue', async ({ userId, rating, problemId }) => {
    console.log(`User ${userId} joined queue with rating ${rating}, preferred problem: ${problemId}`);
    await addToQueue(socket, redis, userId, rating, problemId);
    socket.emit('queue_joined');
  });

  socket.on('leave_queue', async () => {
    console.log(`Socket ${socket.id} leaving queue`);
    await removeFromQueue(socket, redis);
  });

  socket.on('join_room', async ({ roomId, userId }) => {
    console.log(`User ${userId} joined room ${roomId}`);
    await joinRoom(io, socket, redis, roomId, userId);
  });

  socket.on('submit_attempt', async ({ roomId, userId, status }) => {
    await handleSubmission(io, socket, redis, roomId, userId, status);
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    await removeFromQueue(socket, redis);
    await handleDisconnect(io, socket, redis);
  });
});

// Matchmaking Loop
setInterval(() => {
  tryMatchmaking(io, redis).catch(console.error);
}, 3000);

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/internal/match-complete', async (req, res) => {
  const { roomId, winnerId, reason } = req.body;
  if (!roomId) return res.status(400).json({ error: 'Missing roomId' });
  
  io.to(roomId).emit('match_over', { winnerId, reason: reason || 'completed' });
  
  // Clean up redis room state
  await redis.hset(`room:${roomId}`, 'status', 'finished');
  
  res.json({ success: true });
});

// Start Server
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
