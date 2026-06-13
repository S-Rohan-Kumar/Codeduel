import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-950 to-gray-900 text-center">
      <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">CodeDuel</span>
      </h1>
      <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl">
        Compete in real-time 1v1 coding challenges. Climb the leaderboard, prove your skills, and become a champion.
      </p>
      <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-8 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all transform hover:-translate-y-1">
        Enter the Arena
      </Link>
    </div>
  );
}
