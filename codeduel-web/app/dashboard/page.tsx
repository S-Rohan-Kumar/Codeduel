import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function Dashboard() {
  const { userId } = await auth();
  const rawId = userId || '';
  const displayName = rawId.length > 12 ? rawId.substring(0, 8) + '...' : rawId;

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back, {displayName}. Ready for your next duel?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 border-2 border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300">
          <h2 className="text-xl font-semibold mb-2 text-blue-400">Quick Match</h2>
          <p className="text-gray-400 mb-4 text-sm">Find an opponent of similar skill level and jump straight into a duel.</p>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors opacity-50 cursor-not-allowed" disabled>
            Coming Soon
          </button>
        </div>

        <div className="bg-gray-800/50 border-2 border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300">
          <h2 className="text-xl font-semibold mb-2 text-purple-400">Leaderboard</h2>
          <p className="text-gray-400 mb-4 text-sm">See how you stack up against the best coders in the world.</p>
          <button className="w-full bg-purple-600/20 text-purple-300 py-2 rounded-lg font-medium transition-colors opacity-50 cursor-not-allowed" disabled>
            View Standings
          </button>
        </div>

        <div className="bg-gray-800/50 border-2 border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-300 group cursor-pointer">
          <h2 className="text-xl font-semibold mb-2 text-green-400">Practice Problems</h2>
          <p className="text-gray-400 mb-4 text-sm">Browse and solve coding challenges from Codeforces to prepare for your next duel.</p>
          <Link href="/dashboard/problems" className="block text-center w-full bg-green-600/20 group-hover:bg-green-600/40 text-green-300 py-2 rounded-lg font-medium transition-colors">
            View Problems
          </Link>
        </div>
      </div>
    </div>
  );
}
