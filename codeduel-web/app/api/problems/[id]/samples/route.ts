import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: problemId } = await params;
    if (!problemId) return NextResponse.json({ error: 'Problem ID required' }, { status: 400 });

    const testCases = await prisma.testCase.findMany({
      where: { problemId: problemId },
      take: 2,
      orderBy: { id: 'asc' }
    });

    return NextResponse.json({ testCases });
  } catch (error: any) {
    console.error('Error fetching samples:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
