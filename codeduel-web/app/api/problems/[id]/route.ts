import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const problem = await prisma.problem.findUnique({
      where: { id },
      include: { testCases: true }
    });

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    return NextResponse.json({ problem });
  } catch (error: any) {
    console.error(`Error fetching problem ${params}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
