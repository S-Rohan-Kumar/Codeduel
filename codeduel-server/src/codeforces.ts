import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TARGET_TAGS = [
  'dp', 'graphs', 'greedy', 'binary search', 'two pointers', 
  'strings', 'implementation', 'math', 'sortings', 'data structures', 'brute force'
];

let cachedProblemsList: any[] = [];

// Helper to fetch the full problem list from Codeforces API with caching
async function getProblemsList(): Promise<any[]> {
  if (cachedProblemsList.length > 0) {
    return cachedProblemsList;
  }

  console.log('[CF API] Fetching all problems from Codeforces API...');
  try {
    const res = await fetch('https://codeforces.com/api/problemset.problems');
    const data = await res.json();
    if (data.status === 'OK' && data.result && data.result.problems) {
      cachedProblemsList = data.result.problems;
      console.log(`[CF API] Loaded ${cachedProblemsList.length} problems into cache.`);
      return cachedProblemsList;
    }
  } catch (err: any) {
    console.error('[CF API] Error fetching from Codeforces API:', err.message);
  }
  return [];
}

interface ScrapedProblem {
  title: string;
  timeLimit: number;
  memoryLimit: number;
  description: string;
  testCases: { input: string; expectedOutput: string }[];
}

// Scrape problem page from Codeforces mirror
export async function scrapeProblem(contestId: number, index: string): Promise<ScrapedProblem | null> {
  const url = `https://mirror.codeforces.com/problemset/problem/${contestId}/${index}`;
  console.log(`[Scraper] Scraping problem page: ${url}`);
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch page. Status: ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // 1. Get title
    const rawTitle = $('.problem-statement .header .title').text().trim();
    if (!rawTitle) {
      throw new Error('Problem statement title element not found on page.');
    }
    const title = rawTitle.replace(/^[A-Z0-9]+\.\s+/, '');

    // 2. Get limits
    const timeLimitRaw = $('.problem-statement .header .time-limit').text();
    const memoryLimitRaw = $('.problem-statement .header .memory-limit').text();
    
    const timeLimitMatch = timeLimitRaw.match(/(\d+(?:\.\d+)?)\s*second/i);
    const timeLimit = timeLimitMatch ? parseFloat(timeLimitMatch[1]) : 2.0;

    const memoryLimitMatch = memoryLimitRaw.match(/(\d+)\s*megabyte/i);
    const memoryLimit = memoryLimitMatch ? parseInt(memoryLimitMatch[1]) : 256;

    // 3. Structured description parsing
    const cleanSection = (selector: string) => {
      const el = $('.problem-statement').find(selector);
      if (!el.length) return '';
      const clone = el.clone();
      clone.find('.section-title').remove();
      return clone.text().trim();
    };

    // Body paragraphs (exclude specialized headers/divs)
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

    // 4. Sample test cases
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

    if (testCases.length === 0) {
      throw new Error('No test cases found in problem statement.');
    }

    return {
      title,
      timeLimit,
      memoryLimit,
      description: fullDescription,
      testCases
    };
  } catch (err: any) {
    console.error(`[Scraper] Error scraping ${contestId}${index}:`, err.message);
    return null;
  }
}

// Main function to get a dynamic problem
export async function getDynamicProblem(difficulty: string): Promise<any> {
  const problems = await getProblemsList();
  if (problems.length === 0) {
    console.warn('[CF API] Codeforces problem list empty, falling back to local database.');
    return getRandomLocalProblem(difficulty);
  }

  // Filter based on rating and tags
  let minRating = 800;
  let maxRating = 1000;
  if (difficulty === 'Medium') {
    minRating = 1100;
    maxRating = 1300;
  } else if (difficulty === 'Hard') {
    minRating = 1400;
    maxRating = 1700;
  }

  const filtered = problems.filter((p: any) => {
    if (!p.rating || p.rating < minRating || p.rating > maxRating) return false;
    if (!p.tags || !p.tags.some((t: string) => TARGET_TAGS.includes(t))) return false;
    return true;
  });

  if (filtered.length === 0) {
    console.warn(`[CF API] No problems found matching difficulty ${difficulty}, falling back to local database.`);
    return getRandomLocalProblem(difficulty);
  }

  // Pick a random problem and try to load/scrape it (up to 3 retries)
  for (let attempt = 0; attempt < 3; attempt++) {
    const candidate = filtered[Math.floor(Math.random() * filtered.length)];
    const id = `cf-${candidate.contestId}-${candidate.index}`;

    console.log(`[CF API] Selected candidate: ${candidate.name} (Rating: ${candidate.rating}) - Attempt ${attempt + 1}`);

    // Check if it already exists with test cases in DB
    const existing = await prisma.problem.findUnique({
      where: { id },
      include: { testCases: true }
    });

    if (existing && existing.testCases.length > 0) {
      console.log(`[Cache] Found cached problem in database: ${existing.title}`);
      return existing;
    }

    // Otherwise, scrape it
    const scraped = await scrapeProblem(candidate.contestId, candidate.index);
    if (scraped) {
      console.log(`[Scraper] Successfully scraped: ${scraped.title}`);

      // Save to database
      const savedProblem = await prisma.$transaction(async (tx) => {
        // Upsert problem details
        const prob = await tx.problem.upsert({
          where: { id },
          update: {
            title: scraped.title,
            description: scraped.description,
            timeLimit: scraped.timeLimit,
            memoryLimit: scraped.memoryLimit,
            difficulty: difficulty
          },
          create: {
            id,
            title: scraped.title,
            description: scraped.description,
            timeLimit: scraped.timeLimit,
            memoryLimit: scraped.memoryLimit,
            difficulty: difficulty
          }
        });

        // Delete any existing test cases for safety
        await tx.testCase.deleteMany({
          where: { problemId: id }
        });

        // Create new test cases
        for (const tc of scraped.testCases) {
          await tx.testCase.create({
            data: {
              problemId: id,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isHidden: false
            }
          });
        }

        return tx.problem.findUnique({
          where: { id },
          include: { testCases: true }
        });
      });

      return savedProblem;
    }
  }

  // Final fallback
  console.warn('[CF API] Scraper attempts exhausted, falling back to local database.');
  return getRandomLocalProblem(difficulty);
}

// Fallback helper to query the local database
async function getRandomLocalProblem(difficulty: string): Promise<any> {
  let localProblems = await prisma.problem.findMany({
    where: { difficulty },
    include: { testCases: true }
  });

  if (localProblems.length === 0) {
    localProblems = await prisma.problem.findMany({
      include: { testCases: true }
    });
  }

  if (localProblems.length === 0) {
    throw new Error('No problems found in local database, and Codeforces scraper is unavailable.');
  }

  return localProblems[Math.floor(Math.random() * localProblems.length)];
}

// Ensure a specific problem exists in the DB with its test cases
export async function ensureProblem(problemId: string): Promise<any> {
  const existing = await prisma.problem.findUnique({
    where: { id: problemId },
    include: { testCases: true }
  });

  if (existing && existing.testCases.length > 0) {
    return existing;
  }

  if (problemId.startsWith('cf-')) {
    const parts = problemId.split('-');
    if (parts.length === 3) {
      const contestId = parseInt(parts[1], 10);
      const index = parts[2];
      console.log(`[CF API] Dynamically fetching and scraping specific problem ${problemId}...`);
      const scraped = await scrapeProblem(contestId, index);
      
      if (scraped) {
        // Save to database
        const savedProblem = await prisma.$transaction(async (tx) => {
          const prob = await tx.problem.upsert({
            where: { id: problemId },
            update: {
              title: scraped.title,
              description: scraped.description,
              timeLimit: scraped.timeLimit,
              memoryLimit: scraped.memoryLimit,
              difficulty: 'Medium'
            },
            create: {
              id: problemId,
              title: scraped.title,
              description: scraped.description,
              timeLimit: scraped.timeLimit,
              memoryLimit: scraped.memoryLimit,
              difficulty: 'Medium'
            }
          });

          await tx.testCase.deleteMany({
            where: { problemId }
          });

          for (const tc of scraped.testCases) {
            await tx.testCase.create({
              data: {
                problemId,
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                isHidden: false
              }
            });
          }

          return tx.problem.findUnique({
            where: { id: problemId },
            include: { testCases: true }
          });
        });
        return savedProblem;
      }
    }
  }

  return existing;
}
