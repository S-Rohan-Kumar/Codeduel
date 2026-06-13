import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { scrapeProblem } from '../src/codeforces.js';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding...');

  console.log('Seeding custom test cases for cf-2216-A...');
  const courseWishesProblem = await prisma.problem.findUnique({ where: { id: 'cf-2216-A' } });
  if (courseWishesProblem) {
    // Delete ALL existing testcases first so no stale scraped data remains
    const deleted = await prisma.testCase.deleteMany({ where: { problemId: 'cf-2216-A' } });
    console.log(`  Deleted ${deleted.count} old testcases for cf-2216-A.`);

    const customTestCases = [
      { input: "1\n1 1\n1\n2\n", expectedOutput: "CUSTOM_VALIDATED" },
      { input: "1\n1 1\n1\n1\n", expectedOutput: "CUSTOM_VALIDATED" },
      { input: "1\n3 2\n1 2\n3 3 3\n", expectedOutput: "CUSTOM_VALIDATED" },
      { input: "1\n3 2\n1 2\n1 2 3\n", expectedOutput: "CUSTOM_VALIDATED" },
      { input: "1\n2 1\n1\n1 1\n", expectedOutput: "CUSTOM_VALIDATED" }
    ];

    await prisma.testCase.createMany({
      data: customTestCases.map(tc => ({
        problemId: 'cf-2216-A',
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: false
      }))
    });
    console.log(`  Inserted ${customTestCases.length} CUSTOM_VALIDATED testcases for cf-2216-A.`);
    console.log('Finished cf-2216-A custom test cases.');
  } else {
    console.log('Problem cf-2216-A not found in DB, skipping.');
  }

  // 1. Query all Problem records that have no TestCase children
  const problemsWithoutTestCases = await prisma.problem.findMany({
    where: {
      testCases: {
        none: {}
      }
    }
  });

  console.log(`Found ${problemsWithoutTestCases.length} problems without test cases.`);

  for (const problem of problemsWithoutTestCases) {
    console.log(`Processing problem: ${problem.id} (${problem.title})`);
    
    let scrapedTestCases: { input: string; expectedOutput: string }[] | null = null;

    // 2. If it has a cfId like "cf-XXXX-Y", scrape it
    if (problem.id.startsWith('cf-')) {
      const parts = problem.id.split('-');
      if (parts.length === 3) {
        const contestId = parseInt(parts[1], 10);
        const index = parts[2];
        
        try {
          console.log(`Scraping test cases for ${problem.id}...`);
          const scrapedData = await scrapeProblem(contestId, index);
          if (scrapedData && scrapedData.testCases.length > 0) {
            scrapedTestCases = scrapedData.testCases;
            console.log(`Successfully scraped ${scrapedTestCases.length} test cases for ${problem.id}.`);
          }
        } catch (err: any) {
          console.error(`Failed to scrape ${problem.id}:`, err.message);
        }
      }
    }

    // 3. Fallback to hardcoded dummy test cases
    if (!scrapedTestCases || scrapedTestCases.length === 0) {
      console.log(`Falling back to dummy test cases for ${problem.id}.`);
      scrapedTestCases = [
        { input: "1\n1\n", expectedOutput: "1\n" },
        { input: "2\n2\n", expectedOutput: "2\n" }
      ];
    }

    // 4. Upsert testcases into the TestCase table
    // (We use create since we know they don't exist, but upsert/idempotent check is safer)
    for (let i = 0; i < scrapedTestCases.length; i++) {
      const tc = scrapedTestCases[i];
      // Check if it already exists to be truly idempotent
      const existingTc = await prisma.testCase.findFirst({
        where: {
          problemId: problem.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput
        }
      });

      if (!existingTc) {
        await prisma.testCase.create({
          data: {
            problemId: problem.id,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: false
          }
        });
      }
    }
    
    console.log(`Finished processing ${problem.id}.\n`);
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
