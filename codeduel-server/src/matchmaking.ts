import { Server, Socket } from 'socket.io';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { getDynamicProblem, ensureProblem } from './codeforces.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function addToQueue(socket: Socket, redis: Redis, userId: string, rating: number, problemId?: string) {
  // Ensure the user exists in the database to satisfy foreign keys
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      username: userId,
      email: `${userId}@codeduel.com`,
      rating: rating || 1200
    }
  });

  const value = JSON.stringify({ userId, socketId: socket.id, problemId });
  await redis.zadd('matchmaking:queue', rating, value);
  // Also store a mapping from socketId to userId so we can easily remove them on disconnect
  await redis.set(`socket:${socket.id}`, userId);
}

export async function removeFromQueue(socket: Socket, redis: Redis) {
  const userId = await redis.get(`socket:${socket.id}`);
  if (!userId) return;

  const queue = await redis.zrange('matchmaking:queue', 0, -1);
  for (const item of queue) {
    const data = JSON.parse(item);
    if (data.socketId === socket.id || data.userId === userId) {
      await redis.zrem('matchmaking:queue', item);
    }
  }
  await redis.del(`socket:${socket.id}`);
}

export async function tryMatchmaking(io: Server, redis: Redis) {
  const queue = await redis.zrange('matchmaking:queue', 0, -1, 'WITHSCORES');

  // queue is an array of [member, score, member, score, ...]
  const players: { data: { userId: string; socketId: string }; score: number; raw: string }[] = [];
  for (let i = 0; i < queue.length; i += 2) {
    const raw = queue[i];
    const scoreStr = queue[i + 1];
    if (raw !== undefined && scoreStr !== undefined) {
      players.push({
        data: JSON.parse(raw),
        score: parseFloat(scoreStr),
        raw
      });
    }
  }

  // Find adjacent pairs with rating diff <= 300
  for (let i = 0; i < players.length - 1; i++) {
    const p1 = players[i];
    const p2 = players[i + 1];

    if (!p1 || !p2) continue;

    if (Math.abs(p1.score - p2.score) <= 300) {
      // Remove both from queue atomically
      const removed1 = await redis.zrem('matchmaking:queue', p1.raw);
      const removed2 = await redis.zrem('matchmaking:queue', p2.raw);

      if (removed1 === 1 && removed2 === 1) {
        // Successfully grabbed both
        await createMatchRoom(io, redis, p1, p2);
      } else {
        // Someone else grabbed them, or they disconnected.
        if (removed1 === 1) await redis.zadd('matchmaking:queue', p1.score, p1.raw);
        if (removed2 === 1) await redis.zadd('matchmaking:queue', p2.score, p2.raw);
      }

      // Skip the next player since they are matched
      i++;
    }
  }
}

async function createMatchRoom(io: Server, redis: Redis, p1: any, p2: any) {
  const roomId = uuidv4();

  // Determine target difficulty based on average rating
  const avgRating = (p1.score + p2.score) / 2;
  let targetDifficulty = 'Medium';
  if (avgRating < 1200) {
    targetDifficulty = 'Easy';
  } else if (avgRating >= 1400) {
    targetDifficulty = 'Hard';
  }

  // Fetch problem (use preferred problemId if specified by either player, otherwise get random dynamic one)
  const preferredProblemId = p1.data.problemId || p2.data.problemId;
  let problem;
  if (preferredProblemId) {
    console.log(`[Matchmaker] Found preferred problemId: ${preferredProblemId}`);
    try {
      problem = await ensureProblem(preferredProblemId);
    } catch (err: any) {
      console.error(`[Matchmaker] Error loading preferred problem ${preferredProblemId}:`, err.message);
    }
  }

  // Fallback if no preferred problem or it failed to resolve
  if (!problem) {
    console.log(`[Matchmaker] Fetching dynamic problem for difficulty: ${targetDifficulty}`);
    problem = await getDynamicProblem(targetDifficulty);
  }

  if (!problem) {
    console.error('No problem could be resolved dynamically or from database!');
    return;
  }

  // Store room state in Redis
  await redis.hset(`room:${roomId}`, {
    player1: p1.data.userId,
    player2: p2.data.userId,
    status: 'waiting',
    problemId: problem.id,
    startTime: Date.now()
  });
  // Set expiry for the room hash, e.g., 2 hours
  await redis.expire(`room:${roomId}`, 7200);

  // Emit match found
  io.to(p1.data.socketId).emit('match_found', {
    roomId,
    opponentId: p2.data.userId,
    problem
  });

  io.to(p2.data.socketId).emit('match_found', {
    roomId,
    opponentId: p1.data.userId,
    problem
  });
}
