import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get('matchId');
    const problemId = searchParams.get('problemId');
    if (!matchId && !problemId) {
      return NextResponse.json({ error: 'matchId or problemId query param required' }, { status: 400 });
    }

    let problemIdToUse = problemId;

    if (matchId) {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        select: { problemId: true }
      });
      if (!match) {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 });
      }
      problemIdToUse = match.problemId;
    }

    if (!problemIdToUse) {
      return NextResponse.json({ error: 'Could not resolve problemId' }, { status: 400 });
    }

    const testCases = await prisma.testCase.findMany({
      where: { problemId: problemIdToUse },
      take: 2,
      orderBy: { id: 'asc' }
    });

    const samples = testCases.map((tc) => ({
      input: tc.input.startsWith('"') ? JSON.parse(tc.input) : tc.input,
      expectedOutput: tc.expectedOutput.startsWith('"') ? JSON.parse(tc.expectedOutput) : tc.expectedOutput
    }));

    return NextResponse.json({ samples });
  } catch (error: any) {
    console.error('Error fetching samples:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
