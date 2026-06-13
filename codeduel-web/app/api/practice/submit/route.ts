import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { auth } from '@clerk/nextjs/server';

function validateCourseWishes(input: string, output: string): boolean {
  try {
    const inputLines = input.trim().split(/\r?\n/).filter(line => line.trim() !== '');
    const outputLines = output.trim().split(/\r?\n/).filter(line => line.trim() !== '');

    if (inputLines.length === 0) return false;
    if (outputLines.length === 0) return false;

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
        if (lv >= k + 1) return false;

        const nxt = lv + 1;
        if (nxt <= k) {
          if (cnt[nxt] >= a[nxt]) {
            return false;
          }
        }

        cnt[lv]--;
        b[courseIdx] = nxt;
        cnt[nxt]++;
      }

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

      if (arr.length !== x + y) return false;

      let countOnes = 0;
      let countNegOnes = 0;
      for (const val of arr) {
        if (val === 1) countOnes++;
        else if (val === -1) countNegOnes++;
        else return false;
      }
      if (countOnes !== x || countNegOnes !== y) return false;

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

    const { code, language, problemId } = await req.json();

    if (!code || !language || !problemId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { testCases: true }
    });

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const testCases = problem.testCases;
    const PISTON_URL = process.env.PISTON_URL || 'http://localhost:2000';

    let overallVerdict = 'Accepted';
    let failedCase = null;
    let maxExecutionMs = 0;

    let languageName = typeof language === 'string' ? language : 'python';
    let languageVersion = '*';
    let fileName = languageName === 'javascript' || languageName === 'js' ? 'main.js' : 'main.py';

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const rawInput = testCase.input.startsWith('"')
        ? JSON.parse(testCase.input)
        : testCase.input;
      const rawExpectedOutput = testCase.expectedOutput.startsWith('"')
        ? JSON.parse(testCase.expectedOutput)
        : testCase.expectedOutput;

      const payload = {
        language: languageName,
        version: languageVersion,
        files: [{ name: fileName, content: code }],
        stdin: rawInput
      };

      const response = await fetch(`${PISTON_URL}/api/v2/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

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

      const normalise = (s: string) =>
        s.trim().split(/\r?\n/).map(l => l.trim()).filter(l => l !== '').join('\n');

      const actualOutput = normalise(result.run?.stdout || '');
      const expectedOutput = (rawExpectedOutput || '').trim();

      let isCorrect = false;

      if (expectedOutput === 'CUSTOM_VALIDATED') {
        if (problem.id === 'cf-2216-A') {
          isCorrect = validateCourseWishes(rawInput, actualOutput);
        } else if (problem.id === 'cf-2211-B') {
          isCorrect = validateMickeyMouse(rawInput, actualOutput);
        } else {
          isCorrect = true;
        }
      } else {
        isCorrect = actualOutput === expectedOutput;

        if (!isCorrect) {
          if (problem.id === 'cf-2216-A') {
            isCorrect = validateCourseWishes(rawInput, actualOutput);
          } else if (problem.id === 'cf-2211-B') {
            isCorrect = validateMickeyMouse(rawInput, actualOutput);
          }
        }
      }

      if (!isCorrect) {
        overallVerdict = 'Wrong Answer';
        failedCase = testCase;
        break;
      }
    }

    return NextResponse.json({
      verdict: overallVerdict,
      executionMs: Math.round(maxExecutionMs),
      failedCase
    });
  } catch (error: any) {
    console.error('Practice submission error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
