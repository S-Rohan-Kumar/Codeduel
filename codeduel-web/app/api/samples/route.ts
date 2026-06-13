import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get('matchId');
    if (!matchId) {
      return NextResponse.json({ error: 'matchId query param required' }, { status: 400 });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        problem: {
          include: {
            testCases: {
              take: 2,
              orderBy: { id: 'asc' }
            }
          }
        }
      }
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }



    const samples = match.problem.testCases.map((tc) => ({
      input: tc.input.startsWith('"') ? JSON.parse(tc.input) : tc.input,
      expectedOutput: tc.expectedOutput.startsWith('"') ? JSON.parse(tc.expectedOutput) : tc.expectedOutput
    }));

    return NextResponse.json({ samples });
  } catch (error: any) {
    console.error('Error fetching samples:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
