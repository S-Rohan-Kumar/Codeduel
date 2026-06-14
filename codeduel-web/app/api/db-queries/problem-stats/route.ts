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
  p.title,
  p.difficulty,
  COUNT(s.id) AS total_submissions,
  SUM(CASE WHEN s.status = 'Accepted' THEN 1 ELSE 0 END) AS accepted,
  ROUND(
    SUM(CASE WHEN s.status = 'Accepted' THEN 1 ELSE 0 END)::numeric 
    / NULLIF(COUNT(s.id), 0) * 100, 1
  ) AS acceptance_rate_pct
FROM "Problem" p
LEFT JOIN "Match" m ON m."problemId" = p.id
LEFT JOIN "Submission" s ON s."matchId" = m.id
GROUP BY p.id, p.title, p.difficulty
ORDER BY total_submissions DESC NULLS LAST`;

    const rawRows = await prisma.$queryRawUnsafe(sql);
    const rows = serialize(rawRows);
    const columns = rows && rows.length > 0 ? Object.keys(rows[0]) : [];

    return NextResponse.json({
      query: sql,
      columns,
      rows
    });
  } catch (error: any) {
    console.error('Error running problem stats query:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
