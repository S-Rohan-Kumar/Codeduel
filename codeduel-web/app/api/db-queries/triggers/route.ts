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
  trigger_name,
  event_manipulation AS event,
  event_object_table AS table_name,
  action_timing AS timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name`;

    const rawRows = await prisma.$queryRawUnsafe(sql);
    const rows = serialize(rawRows);
    const columns = rows && rows.length > 0 ? Object.keys(rows[0]) : [];

    return NextResponse.json({
      query: sql,
      columns,
      rows
    });
  } catch (error: any) {
    console.error('Error running triggers query:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
