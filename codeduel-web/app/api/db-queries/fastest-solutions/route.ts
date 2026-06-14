import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { auth } from '@clerk/nextjs/server';

function serialize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(serialize);
  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const key of Object.keys(obj)) {
      serialized[key] = serialize(obj[key]);
    }
    return serialized;
  }
  return obj;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sql = `SELECT 
  u.username,
  p.title AS problem,
  p.difficulty,
  s."executionMs",
  TO_CHAR(s."createdAt", 'DD Mon HH24:MI') AS submitted_at
FROM "Submission" s
JOIN "User"    u ON u.id = s."userId"
JOIN "Match"   m ON m.id = s."matchId"
JOIN "Problem" p ON p.id = m."problemId"
WHERE s.status = 'Accepted'
  AND s."executionMs" IS NOT NULL
ORDER BY s."executionMs" ASC
LIMIT 10`;

    const rawRows = await prisma.$queryRawUnsafe(sql);
    const rows = serialize(rawRows);
    const columns = rows && rows.length > 0 ? Object.keys(rows[0]) : [];

    return NextResponse.json({
      query: sql,
      columns,
      rows
    });
  } catch (error: any) {
    console.error('Error running fastest solutions query:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
