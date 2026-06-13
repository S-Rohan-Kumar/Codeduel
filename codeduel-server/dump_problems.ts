import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const problems = await prisma.problem.findMany({
      include: { testCases: true },
      orderBy: { id: 'asc' }
    });

    let content = '# CodeDuel Problems Dump\n\n';

    for (const prob of problems) {
      content += `## Problem: ${prob.title} (${prob.id})\n`;
      content += `- Difficulty: ${prob.difficulty}\n`;
      content += `- Time Limit: ${prob.timeLimit}s\n`;
      content += `- Memory Limit: ${prob.memoryLimit}MB\n\n`;
      
      content += `### Description:\n\`\`\`\n${prob.description}\n\`\`\`\n\n`;
      
      content += `### Seeded Testcases:\n`;
      if (prob.testCases.length === 0) {
        content += `*No testcases seeded.*\n`;
      } else {
        prob.testCases.forEach((tc, idx) => {
          content += `#### Testcase ${idx + 1}:\n`;
          content += `- **Input**:\n\`\`\`\n${tc.input}\n\`\`\`\n`;
          content += `- **Expected Output**:\n\`\`\`\n${tc.expectedOutput}\n\`\`\`\n\n`;
        });
      }
      content += `---\n\n`;
    }

    fs.writeFileSync('problems_dump.md', content);
    console.log('Successfully dumped problems to problems_dump.md');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
