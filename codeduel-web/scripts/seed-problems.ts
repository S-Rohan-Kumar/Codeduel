import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TARGET_TAGS = ['dp', 'graphs', 'greedy', 'binary search', 'two pointers'];

async function main() {
  console.log('Fetching problems from Codeforces API...');
  try {
    const response = await axios.get('https://codeforces.com/api/problemset.problems');
    if (response.data.status !== 'OK') {
      throw new Error('Codeforces API returned non-OK status');
    }

    const allProblems = response.data.result.problems;
    
    // Filter problems
    const validProblems = allProblems.filter((p: any) => {
      // Must have rating
      if (!p.rating || p.rating < 800 || p.rating > 1600) return false;
      // Must have at least one target tag
      if (!p.tags || !p.tags.some((tag: string) => TARGET_TAGS.includes(tag))) return false;
      return true;
    });

    const selectedProblems = validProblems.slice(0, 25);
    console.log(`Found ${selectedProblems.length} matching problems. Seeding database...`);

    for (const p of selectedProblems) {
      const id = `cf-${p.contestId}-${p.index}`;
      
      let difficulty = 'Medium';
      if (p.rating <= 1000) {
        difficulty = 'Easy';
      } else if (p.rating >= 1400) {
        difficulty = 'Hard';
      }

      console.log(`Inserting problem: ${p.name} (${difficulty}, Rating: ${p.rating})`);
      
      await prisma.problem.upsert({
        where: { id },
        update: {},
        create: {
          id,
          title: p.name,
          description: `${p.name}\n\nFull statement at: https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
          difficulty,
          timeLimit: 2.0,
          memoryLimit: 256,
        }
      });

      // TODO: Replace these with real test cases
      // Insert 2 dummy test cases
      const existingTestCases = await prisma.testCase.findMany({ where: { problemId: id } });
      if (existingTestCases.length < 2) {
        for (let i = existingTestCases.length + 1; i <= 2; i++) {
          await prisma.testCase.create({
            data: {
              problemId: id,
              input: '1\n',
              expectedOutput: '1\n',
              isHidden: false
            }
          });
        }
      }
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding problems:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
