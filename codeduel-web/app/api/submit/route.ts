import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { auth } from '@clerk/nextjs/server';

function validateCourseWishes(input: string, output: string): boolean {
  console.log('[validateCourseWishes] input param:', JSON.stringify(input))
  console.log('[validateCourseWishes] output param:', JSON.stringify(output))
  console.log('[validateCourseWishes] inputLines after split:', JSON.stringify(input.trim().split(/\r?\n/).filter(line => line.trim() !== '')))
  console.log('[validateCourseWishes] outputLines after split:', JSON.stringify(output.trim().split(/\r?\n/).filter(line => line.trim() !== '')))
  try {
    const inputLines = input.trim().split(/\r?\n/).filter(line => line.trim() !== '');
    const outputLines = output.trim().split(/\r?\n/).filter(line => line.trim() !== '');

    if (inputLines.length === 0) return false;
    if (outputLines.length === 0) return false; // Guard: empty stdout

    let lineIdx = 0;
    const t = parseInt(inputLines[lineIdx++], 10);

    let outLineIdx = 0;

    for (let tc = 0; tc < t; tc++) {
      if (lineIdx >= inputLines.length) return false;
      const [n, k] = inputLines[lineIdx++].split(/\s+/).map(Number);
      const a = [0, ...inputLines[lineIdx++].split(/\s+/).map(Number)]; // 1-indexed
      const b = inputLines[lineIdx++].split(/\s+/).map(Number); // 0-indexed

      if (outLineIdx >= outputLines.length) return false;
      const numOps = parseInt(outputLines[outLineIdx++], 10);

      let ops: number[] = [];
      if (numOps > 0) {
        if (outLineIdx >= outputLines.length) return false;
        const lineOps = outputLines[outLineIdx++].trim();
        if (lineOps) {
          ops = lineOps.split(/\s+/).map(Number);
        }
      }

      if (ops.length !== numOps) return false;

      // Simulate the level limit checks
      const cnt = Array(k + 2).fill(0);
      for (const lv of b) {
        if (lv <= k + 1) {
          cnt[lv]++;
        }
      }

      for (const op of ops) {
        const courseIdx = op - 1;
        if (courseIdx < 0 || courseIdx >= n) return false;
        const lv = b[courseIdx];
        if (lv >= k + 1) return false; // Already at max level

        const nxt = lv + 1;
        if (nxt <= k) {
          if (cnt[nxt] >= a[nxt]) {
            return false; // Exceeds limit
          }
        }

        // Apply upgrade
        cnt[lv]--;
        b[courseIdx] = nxt;
        cnt[nxt]++;
      }

      // Check if all courses reached target level k + 1
      for (const lv of b) {
        if (lv !== k + 1) return false;
      }
    }

    return true;
  } catch (err) {
    console.error('Error in custom validator for cf-2216-A:', err);
    return false;
  }
}

function getPartitionWays(arr: number[]): number {
  const n = arr.length;
  let totalSum = 0;
  for (const v of arr) totalSum += v;

  const MOD = 676767677;

  if (totalSum === 0) {
    let pref = 0;
    let zeroCount = 0;
    for (let i = 0; i < n - 1; i++) {
      pref += arr[i];
      if (pref === 0) zeroCount++;
    }
    let ans = 1;
    for (let i = 0; i < zeroCount; i++) {
      ans = (ans * 2) % MOD;
    }
    return ans;
  }

  const absSum = Math.abs(totalSum);
  const divisors: number[] = [];
  for (let d = 1; d * d <= absSum; d++) {
    if (absSum % d === 0) {
      divisors.push(d);
      if (d * d !== absSum) {
        divisors.push(absSum / d);
      }
    }
  }

  const signedDivisors = divisors.map(d => totalSum > 0 ? d : -d);

  let totalWays = 0;

  for (const S of signedDivisors) {
    const dpMap = new Map<number, number>();
    dpMap.set(0, 1);

    let currentPref = 0;
    let lastDp = 0;

    for (let i = 0; i < n; i++) {
      currentPref += arr[i];
      const target = currentPref - S;
      const ways = dpMap.get(target) || 0;
      lastDp = ways;

      const currentWays = dpMap.get(currentPref) || 0;
      dpMap.set(currentPref, (currentWays + ways) % MOD);
    }

    totalWays = (totalWays + lastDp) % MOD;
  }

  return totalWays;
}

function validateMickeyMouse(input: string, output: string): boolean {
  try {
    const inputLines = input.trim().split(/\r?\n/).filter(line => line.trim() !== '');
    const outputLines = output.trim().split(/\r?\n/).filter(line => line.trim() !== '');

    if (inputLines.length === 0) return false;

    let lineIdx = 0;
    const t = parseInt(inputLines[lineIdx++], 10);

    let outLineIdx = 0;

    for (let tc = 0; tc < t; tc++) {
      if (lineIdx >= inputLines.length) return false;
      const [x, y] = inputLines[lineIdx++].split(/\s+/).map(Number);

      if (outLineIdx >= outputLines.length) return false;
      const printedAns = parseInt(outputLines[outLineIdx++], 10);

      if (outLineIdx >= outputLines.length) return false;
      const arr = outputLines[outLineIdx++].split(/\s+/).map(Number);

      // 1. Check array constraints
      if (arr.length !== x + y) return false;

      let countOnes = 0;
      let countNegOnes = 0;
      for (const val of arr) {
        if (val === 1) countOnes++;
        else if (val === -1) countNegOnes++;
        else return false;
      }
      if (countOnes !== x || countNegOnes !== y) return false;

      // 2. Compute minimum f(a) mathematically
      const s = Math.abs(x - y);
      let expectedMinWays = 0;
      if (s === 0) {
        expectedMinWays = 1;
      } else {
        for (let d = 1; d * d <= s; d++) {
          if (s % d === 0) {
            expectedMinWays++;
            if (d * d !== s) expectedMinWays++;
          }
        }
      }
      const expectedAns = expectedMinWays % 676767677;

      if (printedAns !== expectedAns) return false;

      // 3. Verify that the printed array actually achieves the min ways
      const actualWays = getPartitionWays(arr);
      if (actualWays !== expectedAns) return false;
    }

    return true;
  } catch (err) {
    console.error('Error in custom validator for cf-2211-B:', err);
    return false;
  }
}



export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { matchId, code, languageId, roomId } = await req.json();

    if (!matchId || !code || !languageId || !roomId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`[SUBMIT] Match ID: ${matchId}, Room ID: ${roomId}, Language: ${languageId}`);

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { problem: { include: { testCases: true } } }
    });

    console.log(`[SUBMIT] Match found: ${!!match}`);
    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

    const problem = match.problem;
    const testCases = problem.testCases;
    console.log(`[SUBMIT] Found problem ${problem.title} with ${testCases.length} test cases.`);

    const submission = await prisma.submission.create({
      data: {
        matchId,
        userId,
        code,
        languageId,
        status: 'running',
      }
    });
    console.log(`[SUBMIT] Created Submission record ${submission.id}`);

    const PISTON_URL = process.env.PISTON_URL || 'http://localhost:2000';

    let overallVerdict = 'Accepted';
    let failedCase = null;
    let maxExecutionMs = 0;

    let languageName = 'python';
    let languageVersion = '*';
    let fileName = 'main.py';


    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const rawInput = testCase.input.startsWith('"')
        ? JSON.parse(testCase.input)
        : testCase.input;
      const rawExpectedOutput = testCase.expectedOutput.startsWith('"')
        ? JSON.parse(testCase.expectedOutput)
        : testCase.expectedOutput;

      console.log(`[SUBMIT] Running Test Case ${i + 1}/${testCases.length}...`);
      console.log(`[SUBMIT] Hitting Piston at ${PISTON_URL}/api/v2/execute`);

      const payload = {
        language: languageName,
        version: languageVersion,
        files: [{ name: fileName, content: code }],
        stdin: rawInput
      };
      console.log(`[SUBMIT] Piston Payload:`, JSON.stringify(payload));

      const response = await fetch(`${PISTON_URL}/api/v2/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log(`[SUBMIT] Piston Result for TC ${i + 1}:`, JSON.stringify(result));

      maxExecutionMs = 50;

      if ((result.compile?.code !== 0 && result.compile?.code != null) || result.compile?.signal) {
        overallVerdict = 'Compilation Error';
        failedCase = testCase;
        break;
      }

      if ((result.run?.code !== 0 && result.run?.code != null) || result.run?.signal) {
        overallVerdict = result.run?.signal === 'SIGKILL' ? 'Time Limit Exceeded' : 'Runtime Error';
        failedCase = testCase;
        break;
      }

      // Normalise output: trim each line to be whitespace-tolerant
      const normalise = (s: string) =>
        s.trim().split(/\r?\n/).map(l => l.trim()).filter(l => l !== '').join('\n');

      const actualOutput = normalise(result.run?.stdout || '');
      const expectedOutput = (rawExpectedOutput || '').trim();

      let isCorrect = false;

      console.log('[VALIDATOR INPUT] raw testCase.input:', JSON.stringify(testCase.input))
      console.log('[VALIDATOR OUTPUT] raw actualOutput:', JSON.stringify(actualOutput))
      console.log('[VALIDATOR] problem.id:', problem.id)
      console.log('[VALIDATOR] expectedOutput sentinel:', testCase.expectedOutput)

      if (expectedOutput === 'CUSTOM_VALIDATED') {
        if (problem.id === 'cf-2216-A') {
          console.log(`[SUBMIT] Sentinel CUSTOM_VALIDATED found, running custom validator for cf-2216-A...`);
          isCorrect = validateCourseWishes(rawInput, actualOutput);
          console.log(`[SUBMIT] Custom simulator validator result: ${isCorrect}`);
        } else if (problem.id === 'cf-2211-B') {
          console.log(`[SUBMIT] Sentinel CUSTOM_VALIDATED found, running custom validator for cf-2211-B...`);
          isCorrect = validateMickeyMouse(rawInput, actualOutput);
          console.log(`[SUBMIT] Custom simulator validator result: ${isCorrect}`);
        } else {
          console.log(`[SUBMIT] Sentinel CUSTOM_VALIDATED found without specific validator for ${problem.id}, treating exitCode 0 as correct.`);
          isCorrect = true;
        }
      } else {
        isCorrect = actualOutput === expectedOutput;

        if (!isCorrect) {
          if (problem.id === 'cf-2216-A') {
            console.log(`[SUBMIT] Strict output match failed for cf-2216-A, running custom simulator validator...`);
            isCorrect = validateCourseWishes(rawInput, actualOutput);
            console.log(`[SUBMIT] Custom simulator validator result: ${isCorrect}`);
          } else if (problem.id === 'cf-2211-B') {
            console.log(`[SUBMIT] Strict output match failed for cf-2211-B, running custom simulator validator...`);
            isCorrect = validateMickeyMouse(rawInput, actualOutput);
            console.log(`[SUBMIT] Custom simulator validator result: ${isCorrect}`);
          }
        }
      }

      if (!isCorrect) {
        overallVerdict = 'Wrong Answer';
        failedCase = testCase;
        break;
      }
    }

    console.log(`[SUBMIT] Overall Verdict: ${overallVerdict}`);

    await prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: overallVerdict,
        executionMs: Math.round(maxExecutionMs)
      }
    });

    let matchCompleted = false;
    let winnerId: string | null = null;

    if (overallVerdict === 'Accepted') {
      const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      try {
        const completeRes = await fetch(`${APP_URL}/api/match/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matchId, winnerId: userId, roomId })
        });
        
        if (completeRes.ok) {
          matchCompleted = true;
          winnerId = userId;
        } else {
          const dbMatch = await prisma.match.findUnique({
            where: { id: matchId }
          });
          if (dbMatch && dbMatch.status === 'completed') {
            matchCompleted = true;
            winnerId = dbMatch.winnerId;
          }
        }
      } catch (err) {
        console.error('[SUBMIT] Error calling match complete:', err);
        const dbMatch = await prisma.match.findUnique({
          where: { id: matchId }
        });
        if (dbMatch && dbMatch.status === 'completed') {
          matchCompleted = true;
          winnerId = dbMatch.winnerId;
        }
      }
    } else {
      const dbMatch = await prisma.match.findUnique({
        where: { id: matchId }
      });
      if (dbMatch && dbMatch.status === 'completed') {
        matchCompleted = true;
        winnerId = dbMatch.winnerId;
      }
    }

    return NextResponse.json({
      verdict: overallVerdict,
      executionMs: Math.round(maxExecutionMs),
      failedCase,
      matchCompleted,
      winnerId
    });
  } catch (error: any) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
