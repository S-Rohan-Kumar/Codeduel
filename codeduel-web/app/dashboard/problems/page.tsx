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
      case 'easy': return 'bg-green-500/20 text-green-500 border-2 border-green-500 px-3 py-1 text-sm inline-block';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-2 border-yellow-500 px-3 py-1 text-sm inline-block';
      case 'hard': return 'bg-red-500/20 text-red-500 border-2 border-red-500 px-3 py-1 text-sm inline-block';
      default: return 'bg-zinc-500/20 text-zinc-300 border-2 border-zinc-500 px-3 py-1 text-sm inline-block';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 uppercase tracking-tighter border-b-4 border-white pb-2 inline-block">
          Problems
        </h1>

        <div className="flex gap-4 mb-8">
          <Link href="/dashboard/problems" className={`px-4 py-1 font-bold border-2 ${!diff || diff === 'ALL' ? 'bg-white text-black border-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>ALL</Link>
          <Link href="/dashboard/problems?difficulty=easy" className={`px-4 py-1 font-bold border-2 ${diff === 'easy' ? 'bg-green-500 text-black border-green-500' : 'border-zinc-700 text-green-500 hover:border-green-500'}`}>EASY</Link>
          <Link href="/dashboard/problems?difficulty=medium" className={`px-4 py-1 font-bold border-2 ${diff === 'medium' ? 'bg-yellow-500 text-black border-yellow-500' : 'border-zinc-700 text-yellow-500 hover:border-yellow-500'}`}>MEDIUM</Link>
          <Link href="/dashboard/problems?difficulty=hard" className={`px-4 py-1 font-bold border-2 ${diff === 'hard' ? 'bg-red-500 text-black border-red-500' : 'border-zinc-700 text-red-500 hover:border-red-500'}`}>HARD</Link>
        </div>

        <div className="border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-black">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-black border-b-4 border-white">
                <th className="p-4 font-bold uppercase tracking-wider border-r-4 border-black">Title</th>
                <th className="p-4 font-bold uppercase tracking-wider border-r-4 border-black">Difficulty</th>
                <th className="p-4 font-bold uppercase tracking-wider">Time Limit</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem, index) => (
                <tr 
                  key={problem.id} 
                  className={`border-b-4 border-white hover:bg-zinc-900 transition-colors group ${index === problems.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="p-0 border-r-4 border-white">
                    <Link 
                      href={`/practice/${problem.id}`}
                      className="block p-4 group-hover:underline font-bold text-lg w-full h-full"
                    >
                      {problem.title}
                    </Link>
                  </td>
                  <td className="p-0 border-r-4 border-white font-bold">
                    <Link href={`/practice/${problem.id}`} className="block p-4 w-full h-full">
                      <span className={getDifficultyBadge(problem.difficulty)}>
                        {problem.difficulty.toUpperCase()}
                      </span>
                    </Link>
                  </td>
                  <td className="p-0 font-bold">
                    <Link href={`/practice/${problem.id}`} className="block p-4 w-full h-full text-zinc-300">
                      {problem.timeLimit.toFixed(1)}s
                    </Link>
                  </td>
                </tr>
              ))}
              {problems.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-zinc-500 font-bold uppercase border-t-0">
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
