import { Server, Socket } from 'socket.io';
import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const roomTimers: Record<string, NodeJS.Timeout> = {};

export async function joinRoom(io: Server, socket: Socket, redis: Redis, roomId: string, userId: string) {
  socket.join(roomId);

  await redis.set(`user_room:${socket.id}`, roomId);
  await redis.set(`user_id:${socket.id}`, userId);

  const roomKey = `room:${roomId}`;
  const roomData = await redis.hgetall(roomKey);

  if (!roomData || !roomData.problemId) {
    socket.emit('error', { message: 'Room not found or expired.' });
    return;
  }

  await redis.sadd(`${roomKey}:players`, userId);
  const playersInRoom = await redis.smembers(`${roomKey}:players`);

  if (playersInRoom.length === 2 && roomData.status === 'waiting') {
    await redis.hset(roomKey, 'status', 'in_progress');
    
    const problem = await prisma.problem.findUnique({
      where: { id: roomData.problemId }
    });

    if (!problem) return;

    const player1Id = playersInRoom[0];
    const player2Id = playersInRoom[1];

    if (!player1Id || !player2Id) return;

    // Ensure users exist in PostgreSQL to satisfy foreign key constraints
    await prisma.user.upsert({
      where: { id: player1Id },
      update: {},
      create: {
        id: player1Id,
        username: player1Id,
        email: `${player1Id}@codeduel.com`,
        rating: 1200
      }
    });

    await prisma.user.upsert({
      where: { id: player2Id },
      update: {},
      create: {
        id: player2Id,
        username: player2Id,
        email: `${player2Id}@codeduel.com`,
        rating: 1200
      }
    });

    // Create Match record
    const match = await prisma.match.create({
      data: {
        problemId: problem.id,
        player1Id: player1Id,
        player2Id: player2Id,
        status: 'in_progress',
      }
    });

    const timeLimitSeconds = 30 * 60; // 30 mins

    io.to(roomId).emit('room_ready', {
      matchId: match.id,
      problem,
      players: playersInRoom,
      timeLimit: timeLimitSeconds
    });

    let timeLeft = timeLimitSeconds;
    roomTimers[roomId] = setInterval(async () => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(roomTimers[roomId]);
        delete roomTimers[roomId];
        io.to(roomId).emit('match_over', { winnerId: null, reason: 'time_up' });
        await redis.hset(roomKey, 'status', 'finished');
      }
    }, 1000);
  }
}

export async function handleSubmission(io: Server, socket: Socket, redis: Redis, roomId: string, userId: string, status: string) {
  // Status: "coding", "submitted"
  socket.to(roomId).emit('opponent_status', status);
}

export async function handleDisconnect(io: Server, socket: Socket, redis: Redis) {
  const roomId = await redis.get(`user_room:${socket.id}`);
  const userId = await redis.get(`user_id:${socket.id}`);
  
  if (roomId && userId) {
    const roomKey = `room:${roomId}`;
    const roomData = await redis.hgetall(roomKey);

    if (roomData && roomData.status === 'in_progress') {
      const winnerId = roomData.player1 === userId ? roomData.player2 : roomData.player1;
      io.to(roomId).emit('match_over', { winnerId, reason: 'opponent_disconnected' });
      await redis.hset(roomKey, 'status', 'finished');
      
      if (roomTimers[roomId]) {
        clearInterval(roomTimers[roomId]);
        delete roomTimers[roomId];
      }
    }
    await redis.srem(`${roomKey}:players`, userId);
  }

  await redis.del(`user_room:${socket.id}`);
  await redis.del(`user_id:${socket.id}`);
}
