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
  SUBSTRING(m.id, 1, 8) AS match_id,
  p.title AS problem,
  p.difficulty,
  u1.username AS player1,
  u2.username AS player2,
  COALESCE(uw.username, 'Ongoing') AS winner,
  m.status,
  COALESCE(
    EXTRACT(EPOCH FROM (m."endTime" - m."startTime"))::INT, 
    0
  ) AS duration_secs
FROM "Match" m
JOIN "Problem"  p  ON p.id = m."problemId"
JOIN "User"     u1 ON u1.id = m."player1Id"
JOIN "User"     u2 ON u2.id = m."player2Id"
LEFT JOIN "User" uw ON uw.id = m."winnerId"
ORDER BY m."startTime" DESC
LIMIT 20`;

    const rawRows = await prisma.$queryRawUnsafe(sql);
    const rows = serialize(rawRows);
    const columns = rows && rows.length > 0 ? Object.keys(rows[0]) : [];

    return NextResponse.json({
      query: sql,
      columns,
      rows
    });
  } catch (error: any) {
    console.error('Error running match history query:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
