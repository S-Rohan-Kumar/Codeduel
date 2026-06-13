import Link from 'next/link';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ProblemsPage({ searchParams }: { searchParams?: { difficulty?: string } | Promise<{ difficulty?: string }> }) {
  const resolvedParams = searchParams instanceof Promise ? await searchParams : searchParams;
  const diff = resolvedParams?.difficulty;

  const problems = await prisma.problem.findMany({
    where: diff && diff !== 'ALL' ? { difficulty: { equals: diff, mode: 'insensitive' } } : undefined,
    orderBy: { title: 'asc' }
  });

  const getDifficultyBadge = (d: string) => {
    switch (d.toLowerCase()) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'hard': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default: return 'bg-neutral-800 text-neutral-400 border border-neutral-700/50';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black tracking-tight text-white mb-6">
          Practice Problems
        </h1>

        <div className="flex flex-wrap gap-2 mb-6 text-xs uppercase font-semibold tracking-wider">
          <Link 
            href="/dashboard/problems" 
            className={`px-4 py-2 rounded-full border transition-all cursor-pointer ${
              !diff || diff === 'ALL' 
                ? 'bg-neutral-200 text-neutral-950 border-neutral-200 font-bold shadow-md' 
                : 'bg-neutral-900 border-neutral-850 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
            }`}
          >
            All
          </Link>
          <Link 
            href="/dashboard/problems?difficulty=easy" 
            className={`px-4 py-2 rounded-full border transition-all cursor-pointer ${
              diff === 'easy' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-550 font-bold shadow-md shadow-emerald-500/5' 
                : 'bg-neutral-900 border-neutral-855 text-emerald-500/70 hover:text-emerald-400 hover:border-emerald-500/40'
            }`}
          >
            Easy
          </Link>
          <Link 
            href="/dashboard/problems?difficulty=medium" 
            className={`px-4 py-2 rounded-full border transition-all cursor-pointer ${
              diff === 'medium' 
                ? 'bg-amber-500/10 text-amber-400 border-amber-550 font-bold shadow-md shadow-amber-500/5' 
                : 'bg-neutral-900 border-neutral-855 text-amber-500/70 hover:text-amber-400 hover:border-amber-500/40'
            }`}
          >
            Medium
          </Link>
          <Link 
            href="/dashboard/problems?difficulty=hard" 
            className={`px-4 py-2 rounded-full border transition-all cursor-pointer ${
              diff === 'hard' 
                ? 'bg-rose-500/10 text-rose-400 border-rose-550 font-bold shadow-md shadow-rose-500/5' 
                : 'bg-neutral-900 border-neutral-855 text-rose-500/70 hover:text-rose-400 hover:border-rose-500/40'
            }`}
          >
            Hard
          </Link>
        </div>

        <div className="overflow-hidden bg-neutral-900/20 border border-neutral-800/80 rounded-2xl shadow-xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-800/80 bg-neutral-900/40 text-neutral-400 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-6">Title</th>
                <th className="py-3 px-6 w-36">Difficulty</th>
                <th className="py-3 px-6 w-36">Time Limit</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem) => (
                <tr 
                  key={problem.id} 
                  className="border-b border-neutral-900/50 hover:bg-neutral-900/30 transition-colors group last:border-b-0"
                >
                  <td className="py-3 px-6 font-semibold text-neutral-200">
                    <Link 
                      href={`/practice/${problem.id}`}
                      className="hover:text-amber-400 transition-colors block w-full h-full"
                    >
                      {problem.title}
                    </Link>
                  </td>
                  <td className="py-3 px-6">
                    <Link href={`/practice/${problem.id}`} className="block w-full h-full">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getDifficultyBadge(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </Link>
                  </td>
                  <td className="py-3 px-6 font-medium text-neutral-400">
                    <Link href={`/practice/${problem.id}`} className="block w-full h-full">
                      {problem.timeLimit.toFixed(1)}s
                    </Link>
                  </td>
                </tr>
              ))}
              {problems.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-neutral-500 font-medium">
                    No problems found. Run the seed script.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
