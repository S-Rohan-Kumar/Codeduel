import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding...');

  // Force re-seed ALL 25 problem IDs — clears stale/wrong testcases
  const FORCE_RESEED = [
    'cf-2203-B', 'cf-2203-C', 'cf-2204-B', 'cf-2204-D',
    'cf-2205-C', 'cf-2206-K', 'cf-2207-A', 'cf-2207-B',
    'cf-2207-C', 'cf-2208-B', 'cf-2208-C', 'cf-2209-A',
    'cf-2209-B', 'cf-2210-A', 'cf-2210-B', 'cf-2210-C1',
    'cf-2211-B', 'cf-2211-C1', 'cf-2216-A', 'cf-2216-B',
    'cf-2217-B', 'cf-2218-B', 'cf-2218-C', 'cf-2218-D',
    'cf-2218-E'
  ];

  for (const id of FORCE_RESEED) {
    const p = await prisma.problem.findUnique({ where: { id } });
    if (p) {
      await prisma.testCase.deleteMany({ where: { problemId: p.id } });
      console.log(`  Cleared test cases for ${id}`);
    }
  }

  // ── cf-2216-A — Course Wishes ─────────────────────────────────────────────
  // Input: t, then per TC: "n k", then k capacities, then n wish levels
  // CUSTOM_VALIDATED (constructive sequence output)
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2216-A' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "1\n1 1\n1\n2", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n1 1\n1\n1", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n3 2\n1 2\n3 3 3", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n3 2\n1 2\n1 2 3", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n2 1\n1\n1 1", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2216-A.');
      } else {
        console.log('  Test cases for cf-2216-A already exist, skipping.');
      }
    }
  }

  // ── cf-2203-B — Beautiful Numbers ─────────────────────────────────────────
  // Input: t, then per TC: single integer x (1 ≤ x ≤ 10^18)
  // Output: minimum moves to make digit sum ≤ 9 — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2203-B' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "3\n1\n9\n29", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "2\n999\n100", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n1000000000000000000", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2203-B.');
      } else {
        console.log('  Test cases for cf-2203-B already exist, skipping.');
      }
    }
  }

  // ── cf-2203-C — Test Generator ────────────────────────────────────────────
  // Input: t, then per TC: "s m" (two integers, 1 ≤ s,m ≤ 10^18)
  // Output: -1 or min length n — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2203-C' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "3\n13 5\n13 3\n13 6", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n1 1", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n1000000000000000000 1000000000000000000", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2203-C.');
      } else {
        console.log('  Test cases for cf-2203-C already exist, skipping.');
      }
    }
  }

  // ── cf-2204-B — Right Maximum ─────────────────────────────────────────────
  // Input: t, then per TC: n, then n integers a_i
  // Output: count of operations — DETERMINISTIC (100% verified)
  // Verified: scan from right, count new maximums
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2204-B' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "3\n5\n2 1 2 3 1\n3\n1 2 3\n4\n4 3 2 1", expectedOutput: "2\n1\n4", isHidden: false },
            { problemId: prob.id, input: "1\n5\n5 1 4 2 3", expectedOutput: "3", isHidden: false },
            { problemId: prob.id, input: "1\n6\n1 3 5 4 2 5", expectedOutput: "2", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2204-B.');
      } else {
        console.log('  Test cases for cf-2204-B already exist, skipping.');
      }
    }
  }

  // ── cf-2204-D — Alternating Path ──────────────────────────────────────────
  // Input: t, then per TC: n, then n integers (colours/values)
  // CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2204-D' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "1\n4\n1 2 3 4", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n6\n1 2 3 4 5 6", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n2\n1 2", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2204-D.');
      } else {
        console.log('  Test cases for cf-2204-D already exist, skipping.');
      }
    }
  }

  // ── cf-2205-C — Simons and Posting Blogs ──────────────────────────────────
  // Input: t, then per TC: n, then n lines each: "l_i a_{i,1} ... a_{i,l_i}"
  // Output: m integers Q — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2205-C' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "1\n2\n3 1 2 3\n2 4 5", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n1\n2 6 1", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n3\n1 1\n1 2\n1 3", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2205-C.');
      } else {
        console.log('  Test cases for cf-2205-C already exist, skipping.');
      }
    }
  }

  // ── cf-2206-K — Time Display Stickers ────────────────────────────────────
  // Input: t, then per TC: n, then string S of length n (digits 0-9)
  // Output: max time displays — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2206-K' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "2\n6\n105901\n8\n10592740", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n4\n1111", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n1\n5", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2206-K.');
      } else {
        console.log('  Test cases for cf-2206-K already exist, skipping.');
      }
    }
  }

  // ── cf-2207-A — 1-1 ───────────────────────────────────────────────────────
  // Input: t, then per TC: n (n≥3), then binary string of length n
  // Output: "min max" — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2207-A' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "2\n3\n111\n4\n1010", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n5\n11001", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n6\n011011", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2207-A.');
      } else {
        console.log('  Test cases for cf-2207-A already exist, skipping.');
      }
    }
  }

  // ── cf-2207-B — One Night At Freddy's ────────────────────────────────────
  // Input: t, then per TC: "n m l", then n integers a_i
  // Output: single integer x — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2207-B' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "1\n1 2 10\n10", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n1 1 32\n25", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n3 3 30\n10 20 30", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2207-B.');
      } else {
        console.log('  Test cases for cf-2207-B already exist, skipping.');
      }
    }
  }

  // ── cf-2207-C — Where's My Water ─────────────────────────────────────────
  // Input: t, then per TC: "n h", then n integers a_i
  // Output: single integer — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2207-C' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "1\n5 10\n3 1 4 1 5", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n3 5\n5 5 5", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n1 1\n1", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2207-C.');
      } else {
        console.log('  Test cases for cf-2207-C already exist, skipping.');
      }
    }
  }

  // ── cf-2208-B — Cyclists ──────────────────────────────────────────────────
  // Input: t, then per TC: "n k p m", then n integers a_i
  // Output: single integer — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2208-B' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "2\n3 2 2 6\n2 1 2\n3 1 1 1\n1 1 1", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n4 3 4 5\n3 8 1 4", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n1 1 1 5\n3", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2208-B.');
      } else {
        console.log('  Test cases for cf-2208-B already exist, skipping.');
      }
    }
  }

  // ── cf-2208-C — Stamina and Tasks ─────────────────────────────────────────
  // Input: t, then per TC: n, then n lines of "c_i p_i"
  // Output: real number — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2208-C' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "2\n2\n10 0\n20 0\n3\n10 5\n20 0\n1 10", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n1\n5 50", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n3\n10 0\n20 50\n30 0", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2208-C.');
      } else {
        console.log('  Test cases for cf-2208-C already exist, skipping.');
      }
    }
  }

  // ── cf-2209-A — Flip Flops ────────────────────────────────────────────────
  // Input: t, then per TC: "n c k", then n integers a_i
  // Output: single integer (max combat power) — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2209-A' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "2\n3 10 5\n1 2 3\n2 0 0\n5 10", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n1 5 3\n4", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n3 0 100\n1 2 3", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2209-A.');
      } else {
        console.log('  Test cases for cf-2209-A already exist, skipping.');
      }
    }
  }

  // ── cf-2209-B — Array ─────────────────────────────────────────────────────
  // Input: t, then per TC: n, then n integers a_i (can be negative)
  // Output: n space-separated integers — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2209-B' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "2\n3\n1 2 3\n4\n3 1 2 4", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n5\n-195 78 15 15 998244353", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n4\n10 10 10 10", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2209-B.');
      } else {
        console.log('  Test cases for cf-2209-B already exist, skipping.');
      }
    }
  }

  // ── cf-2210-A — A Simple Sequence ─────────────────────────────────────────
  // Input: t, then per TC: single integer n (n ≥ 2)
  // Output: permutation of 1..n — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2210-A' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "3\n2\n3\n4", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n5", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n10", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2210-A.');
      } else {
        console.log('  Test cases for cf-2210-A already exist, skipping.');
      }
    }
  }

  // ── cf-2210-B — Simply Sitting on Chairs ─────────────────────────────────
  // Input: t, then per TC: n, then n integers p_i (permutation of 1..n)
  // Output: single integer — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2210-B' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "2\n3\n3 1 2\n4\n1 4 3 2", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n5\n1 2 3 4 5", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n4\n2 1 4 3", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2210-B.');
      } else {
        console.log('  Test cases for cf-2210-B already exist, skipping.');
      }
    }
  }

  // ── cf-2210-C1 — A Simple GCD Problem (Easy Version) ─────────────────────
  // Input: t, then per TC: n, then array a (n integers), then array b (n integers, b=a)
  // Output: single integer — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2210-C1' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "1\n3\n2 4 6\n2 4 6", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n2\n6 6\n6 6", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n4\n1 2 3 4\n1 2 3 4", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2210-C1.');
      } else {
        console.log('  Test cases for cf-2210-C1 already exist, skipping.');
      }
    }
  }

  // ── cf-2211-B — Mickey Mouse Constructive ────────────────────────────────
  // Input: t, then per TC: "x y"
  // Output: answer mod + array — CUSTOM_VALIDATED (custom validator in route.ts)
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2211-B' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "1\n3 2", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n1 1", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n2 1", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2211-B.');
      } else {
        console.log('  Test cases for cf-2211-B already exist, skipping.');
      }
    }
  }

  // ── cf-2211-C1 — Equal Multisets (Easy Version) ───────────────────────────
  // Input: t, then per TC: "n k", then array a (n integers), then array b (n integers, may contain -1)
  // Note: a is guaranteed permutation in Easy version
  // Output: YES or NO — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2211-C1' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "1\n5 5\n1 2 3 4 5\n5 4 3 2 1", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n4 2\n1 2 3 4\n2 1 4 3", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n3 3\n1 2 3\n3 2 1", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2211-C1.');
      } else {
        console.log('  Test cases for cf-2211-C1 already exist, skipping.');
      }
    }
  }

  // ── cf-2216-B — THU Packing Puzzle ───────────────────────────────────────
  // Input: t, then per TC: "cT cH cU" (three non-negative integers)
  // Output: single integer (min n) — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2216-B' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "3\n1 0 0\n0 1 0\n0 0 1", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n1000000000 0 0", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "2\n1 1 1\n2 0 2", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2216-B.');
      } else {
        console.log('  Test cases for cf-2216-B already exist, skipping.');
      }
    }
  }

  // ── cf-2217-B — Flip the Bit (Easy Version) ───────────────────────────────
  // Input: t, then per TC: "n k", then n integers (binary), then k integers (special indices)
  // Output: single integer — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2217-B' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "2\n3 1\n0 1 0\n2\n5 1\n1 1 1 1 1\n3", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n4 1\n0 0 0 0\n2", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n5 1\n1 0 1 0 1\n3", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2217-B.');
      } else {
        console.log('  Test cases for cf-2217-B already exist, skipping.');
      }
    }
  }

  // ── cf-2218-B — The 67th 6-7 Integer Problem ─────────────────────────────
  // Input: t, then per TC: 7 space-separated integers (-67 ≤ a_i ≤ 67)
  // Output: single integer (max sum after negating 6 of 7) — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2218-B' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "2\n1 2 3 4 5 6 7\n-67 -67 -67 -67 -67 -67 67", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n0 0 0 0 0 0 0", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n67 67 67 67 67 67 67", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2218-B.');
      } else {
        console.log('  Test cases for cf-2218-B already exist, skipping.');
      }
    }
  }

  // ── cf-2218-C — The 67th Permutation Problem ─────────────────────────────
  // Input: t, then per TC: single integer n (1 ≤ n ≤ 10^5)
  // Output: permutation of length 3n — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2218-C' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "3\n1\n2\n3", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n5", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n10", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2218-C.');
      } else {
        console.log('  Test cases for cf-2218-C already exist, skipping.');
      }
    }
  }

  // ── cf-2218-D — The 67th OEIS Problem ────────────────────────────────────
  // Input: t, then per TC: single integer n (2 ≤ n ≤ 10^4)
  // Output: n space-separated integers — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2218-D' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "3\n2\n3\n5", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n4", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n10", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2218-D.');
      } else {
        console.log('  Test cases for cf-2218-D already exist, skipping.');
      }
    }
  }

  // ── cf-2218-E — The 67th XOR Problem ─────────────────────────────────────
  // Input: t, then per TC: n, then n integers a_i (0 ≤ a_i ≤ 10^9)
  // Output: single integer (max final XOR value) — CUSTOM_VALIDATED
  {
    const prob = await prisma.problem.findUnique({ where: { id: 'cf-2218-E' } });
    if (prob) {
      const count = await prisma.testCase.count({ where: { problemId: prob.id } });
      if (count === 0) {
        await prisma.testCase.createMany({
          data: [
            { problemId: prob.id, input: "2\n2\n1 2\n3\n1 2 3", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n4\n0 0 0 0", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
            { problemId: prob.id, input: "1\n5\n1 3 5 7 9", expectedOutput: "CUSTOM_VALIDATED", isHidden: false },
          ]
        });
        console.log('  Seeded test cases for cf-2218-E.');
      } else {
        console.log('  Test cases for cf-2218-E already exist, skipping.');
      }
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
