import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function scrapeProblem(contestId: number, index: string) {
  const url = `https://mirror.codeforces.com/problemset/problem/${contestId}/${index}`;
  console.log(`Scraping: ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive'
      }
    });

    if (!res.ok) {
      throw new Error(`Status: ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const rawTitle = $('.problem-statement .header .title').text().trim();
    const title = rawTitle.replace(/^[A-Z0-9]+\.\s+/, '');

    const timeLimitRaw = $('.problem-statement .header .time-limit').text();
    const memoryLimitRaw = $('.problem-statement .header .memory-limit').text();
    
    const timeLimitMatch = timeLimitRaw.match(/(\d+(?:\.\d+)?)\s*second/i);
    const timeLimit = timeLimitMatch ? parseFloat(timeLimitMatch[1]) : 2.0;

    const memoryLimitMatch = memoryLimitRaw.match(/(\d+)\s*megabyte/i);
    const memoryLimit = memoryLimitMatch ? parseInt(memoryLimitMatch[1]) : 256;

    const cleanSection = (selector: string) => {
      const el = $('.problem-statement').find(selector);
      if (!el.length) return '';
      const clone = el.clone();
      clone.find('.section-title').remove();
      return clone.text().trim();
    };

    const bodyClone = $('.problem-statement').clone();
    bodyClone.find('.header').remove();
    bodyClone.find('.input-specification').remove();
    bodyClone.find('.output-specification').remove();
    bodyClone.find('.sample-tests').remove();
    bodyClone.find('.note').remove();
    const bodyText = bodyClone.text().trim();

    const inputSpec = cleanSection('.input-specification');
    const outputSpec = cleanSection('.output-specification');
    const note = cleanSection('.note');

    let fullDescription = bodyText;
    if (inputSpec) {
      fullDescription += `\n\n### Input Description\n${inputSpec}`;
    }
    if (outputSpec) {
      fullDescription += `\n\n### Output Description\n${outputSpec}`;
    }
    if (note) {
      fullDescription += `\n\n### Note\n${note}`;
    }

    const testCases: { input: string; expectedOutput: string }[] = [];
    $('.sample-test').each((_, element) => {
      const inputs = $(element).find('.input');
      const outputs = $(element).find('.output');

      inputs.each((i, inputElem) => {
        const outputElem = outputs.eq(i);
        if (outputElem.length > 0) {
          let inputVal = '';
          const preInput = $(inputElem).find('pre');
          
          if (preInput.find('.test-example-line').length > 0) {
            const lines: string[] = [];
            preInput.find('.test-example-line').each((_, lineElem) => {
              lines.push($(lineElem).text().trim());
            });
            inputVal = lines.join('\n') + '\n';
          } else {
            preInput.find('br').replaceWith('\n');
            inputVal = preInput.text().trim() + '\n';
          }

          let outputVal = '';
          const preOutput = $(outputElem).find('pre');
          preOutput.find('br').replaceWith('\n');
          outputVal = preOutput.text().trim() + '\n';

          testCases.push({
            input: inputVal,
            expectedOutput: outputVal
          });
        }
      });
    });

    return { title, timeLimit, memoryLimit, description: fullDescription, testCases };
  } catch (err: any) {
    console.error(`Error scraping ${contestId}${index}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('Retrieving problems from local database...');
  const problems = await prisma.problem.findMany();
  console.log(`Found ${problems.length} problems. Filtering Codeforces problems...`);

  const cfProblems = problems.filter(p => p.id.startsWith('cf-'));
  console.log(`Found ${cfProblems.length} Codeforces problems to process.`);

  for (const prob of cfProblems) {
    const parts = prob.id.split('-');
    if (parts.length !== 3) {
      console.log(`Skipping invalid ID: ${prob.id}`);
      continue;
    }

    const contestId = parseInt(parts[1], 10);
    const index = parts[2];

    console.log(`\nProcessing ${prob.title} (${prob.id})...`);
    
    // Check if we already have real test cases (not just "1\n")
    const existingTCs = await prisma.testCase.findMany({
      where: { problemId: prob.id }
    });

    const hasDummyTC = existingTCs.length === 0 || existingTCs.some(tc => tc.input === '1\n' && tc.expectedOutput === '1\n');

    if (!hasDummyTC) {
      console.log(`Problem ${prob.title} already has real test cases. Skipping.`);
      continue;
    }

    const scraped = await scrapeProblem(contestId, index);
    if (!scraped) {
      console.log(`Failed to scrape problem ${prob.id}. Skipping.`);
      continue;
    }

    console.log(`Updating problem details and test cases...`);
    await prisma.$transaction(async (tx) => {
      await tx.problem.update({
        where: { id: prob.id },
        data: {
          title: scraped.title,
          description: scraped.description,
          timeLimit: scraped.timeLimit,
          memoryLimit: scraped.memoryLimit
        }
      });

      await tx.testCase.deleteMany({
        where: { problemId: prob.id }
      });

      for (const tc of scraped.testCases) {
        await tx.testCase.create({
          data: {
            problemId: prob.id,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: false
          }
        });
      }
    });

    console.log(`Successfully updated ${scraped.title} with ${scraped.testCases.length} sample test cases.`);
    // Sleep for 1 second between requests to avoid rate limits/blocks
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\nAll problems processed successfully!');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
