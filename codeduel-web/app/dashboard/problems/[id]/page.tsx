import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../../../lib/prisma';

export default async function ProblemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const problem = await prisma.problem.findUnique({
    where: { id }
  });

  if (!problem) {
    notFound();
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'bg-green-500 text-black';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'hard': return 'bg-red-500 text-white';
      default: return 'bg-white text-black';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard/problems" className="inline-block mb-8 hover:underline uppercase font-bold tracking-wider">
          ← Back to Problems
        </Link>

        <div className="border-4 border-white p-8 shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              {problem.title}
            </h1>
            <div className={`px-4 py-2 font-bold uppercase tracking-widest border-2 border-white ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </div>
          </div>

          <div className="flex gap-8 mb-8 border-t-2 border-b-2 border-white py-4 font-bold">
            <div>
              <span className="text-zinc-500 uppercase tracking-widest text-sm block mb-1">Time Limit</span>
              {problem.timeLimit.toFixed(1)}s
            </div>
            <div>
              <span className="text-zinc-500 uppercase tracking-widest text-sm block mb-1">Memory Limit</span>
              {problem.memoryLimit} MB
            </div>
          </div>

          <div className="whitespace-pre-wrap text-lg leading-relaxed">
            {problem.description}
          </div>

          <div className="mt-12 pt-8 border-t-4 border-white">
            <Link href={`/dashboard/play?problemId=${problem.id}`} className="block text-center w-full bg-white text-black font-black uppercase tracking-widest py-4 text-xl hover:bg-zinc-300 transition-colors border-4 border-black">
              Start Duel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
