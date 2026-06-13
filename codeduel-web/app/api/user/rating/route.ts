import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const matchesCount = await prisma.match.count({
      where: {
        OR: [
          { player1Id: userId },
          { player2Id: userId }
        ]
      }
    });

    const winsCount = await prisma.match.count({
      where: {
        winnerId: userId
      }
    });

    const rawId = userId || '';
    const displayName = rawId.length > 12 ? rawId.substring(0, 8) + '...' : rawId;

    return NextResponse.json({
      username: user?.username ?? displayName,
      rating: user?.rating ?? 1200,
      matchesCount,
      winsCount
    });
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
