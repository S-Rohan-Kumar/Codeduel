import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { code, language, stdin } = await req.json();

    if (!code || !language) {
      return NextResponse.json({ error: 'Missing code or language' }, { status: 400 });
    }

    const PISTON_URL = process.env.PISTON_URL || 'http://localhost:2000';
    if (!process.env.PISTON_URL) {
      console.error('[RUN] ERROR: PISTON_URL not set in env');
    }

    let languageVersion = '*';
    let fileName = 'main.py';

    const payload = {
      language: language,
      version: languageVersion,
      files: [{ name: fileName, content: code }],
      stdin: stdin || ''
    };

    console.log('[RUN] PISTON_URL:', process.env.PISTON_URL);
    console.log('[RUN] stdin received:', JSON.stringify(stdin));
    console.log('[RUN] payload being sent to Piston:', JSON.stringify(payload));

    let response;
    try {
      response = await fetch(`${PISTON_URL}/api/v2/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('[RUN] Piston fetch FAILED:', err);
      return NextResponse.json({ 
        stdout: '', 
        stderr: 'Piston server unreachable', 
        exitCode: 1 
      });
    }

    const result = await response.json();
    console.log('[RUN] Piston HTTP status:', response.status);
    console.log('[RUN] Piston full result:', JSON.stringify(result));
    console.log('[RUN] result.run:', JSON.stringify(result.run));
    console.log('[RUN] result.compile:', JSON.stringify(result.compile));
    
    return NextResponse.json({
      stdout: result.run?.stdout ?? '',
      stderr: result.run?.stderr ?? result.compile?.stderr ?? '',
      exitCode: result.run?.code ?? result.compile?.code ?? 1,
      signal: result.run?.signal ?? null,
      compileError: result.compile?.code !== 0 ? result.compile?.stderr : null,
      raw: result  // temporary, remove after debugging
    });
  } catch (error: any) {
    console.error('Run error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
