import * as dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const problem = await prisma.problem.findFirst({
    where: { title: 'Alternating Path' }
  });

  if (!problem) {
    console.log("Problem 'Alternating Path' not found.");
    return;
  }

  console.log(`Found problem: ${problem.id}`);

  // Delete existing placeholder test cases
  await prisma.testCase.deleteMany({
    where: { problemId: problem.id }
  });

  // Insert real test case 1 (Bipartite graph)
  await prisma.testCase.create({
    data: {
      problemId: problem.id,
      input: "1\n4 4\n1 2\n2 3\n3 4\n4 1\n",
      expectedOutput: "2",
      isHidden: false
    }
  });

  // Insert real test case 2 (Non-bipartite graph / Odd cycle)
  await prisma.testCase.create({
    data: {
      problemId: problem.id,
      input: "1\n3 3\n1 2\n2 3\n3 1\n",
      expectedOutput: "0",
      isHidden: true
    }
  });

  console.log("Test cases for 'Alternating Path' updated successfully with real data.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
