import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const { matchId, winnerId, roomId } = await req.json();
    const userId = winnerId;
    console.log('[MATCH COMPLETE] winnerId:', winnerId)
    console.log('[MATCH COMPLETE] userId from submit:', userId)
    console.log('[MATCH COMPLETE] emitting to players...')

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { player1: true, player2: true }
    });

    if (!match || match.status === 'completed') {
      return NextResponse.json({ error: 'Invalid match or already completed' }, { status: 400 });
    }

    const isPlayer1Winner = winnerId === match.player1Id;
    const winner = isPlayer1Winner ? match.player1 : match.player2;
    const loser = isPlayer1Winner ? match.player2 : match.player1;
    const actualWinnerId = winner.id;

    await prisma.match.update({
      where: { id: matchId },
      data: {
        winnerId: actualWinnerId,
        status: 'completed',
        endTime: new Date()
      }
    });

    const K = 32;
    const expectedWinner = 1 / (1 + Math.pow(10, (loser.rating - winner.rating) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winner.rating - loser.rating) / 400));

    const newWinnerRating = Math.round(winner.rating + K * (1 - expectedWinner));
    const newLoserRating = Math.round(loser.rating + K * (0 - expectedLoser));

    await prisma.$transaction([
      prisma.user.update({
        where: { id: winner.id },
        data: {
          rating: newWinnerRating,
          matchesWon: { increment: 1 }
        }
      }),
      prisma.user.update({
        where: { id: loser.id },
        data: {
          rating: newLoserRating,
          matchesLost: { increment: 1 }
        }
      })
    ]);

    const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    await fetch(`${SERVER_URL}/internal/match-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, winnerId: actualWinnerId })
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Match complete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
