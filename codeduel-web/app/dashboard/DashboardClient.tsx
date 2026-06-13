'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '../../hooks/useSocket';
import Link from 'next/link';

interface UserStats {
  username: string;
  rating: number;
  matchesCount: number;
  winsCount: number;
}

export default function DashboardClient({ userId }: { userId: string }) {
  const router = useRouter();
  const { socket, isConnected } = useSocket();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | null>(null);
  const [queueState, setQueueState] = useState<'idle' | 'searching' | 'matched'>('idle');
  const [roomId, setRoomId] = useState<string | null>(null);

  // Fetch stats on mount
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/user/rating');
      const data = await res.json();
      if (!data.error) {
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  // Handle matchmaking socket events
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('match_found', ({ roomId }) => {
      setQueueState('matched');
      setRoomId(roomId);
      setTimeout(() => {
        router.push(`/arena/${roomId}`);
      }, 1000);
    });

    return () => {
      socket.off('match_found');
    };
  }, [socket, isConnected]);

  const handleStartMatchmaking = () => {
    if (!socket || !isConnected || !selectedDifficulty) return;

    let ratingToJoin = 1200;
    if (selectedDifficulty === 'Easy') ratingToJoin = 1000;
    else if (selectedDifficulty === 'Medium') ratingToJoin = 1200;
    else if (selectedDifficulty === 'Hard') ratingToJoin = 1500;

    socket.emit('join_queue', {
      userId,
      rating: ratingToJoin
    });

    setModalOpen(false);
    setQueueState('searching');
  };

  const handleCancelMatchmaking = () => {
    if (socket) {
      socket.emit('leave_queue');
    }
    setQueueState('idle');
  };

  const getDifficultyColor = (diff: 'Easy' | 'Medium' | 'Hard') => {
    switch (diff) {
      case 'Easy': return 'border-green-500 text-green-500 hover:bg-green-500/10';
      case 'Medium': return 'border-yellow-500 text-yellow-500 hover:bg-yellow-500/10';
      case 'Hard': return 'border-red-500 text-red-500 hover:bg-red-500/10';
    }
  };

  const getDifficultyBgSelected = (diff: 'Easy' | 'Medium' | 'Hard') => {
    switch (diff) {
      case 'Easy': return 'bg-green-500/20 border-green-500 text-green-400';
      case 'Medium': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case 'Hard': return 'bg-red-500/20 border-red-500 text-red-400';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full font-mono text-white relative min-h-[80vh]">
      {/* MATCHING FULL SCREEN OVERLAY */}
      {queueState === 'searching' && (
        <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-50 p-8 border-4 border-white shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] max-w-2xl h-96 m-auto rounded-none">
          <div className="flex space-x-2 mb-8">
            <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-widest mb-2 animate-pulse text-white">
            Finding opponent...
          </h2>
          <p className="text-lg font-bold uppercase mb-1 text-zinc-400">
            Difficulty: <span className={
              selectedDifficulty === 'Easy' ? 'text-green-500' :
              selectedDifficulty === 'Medium' ? 'text-yellow-500' : 'text-red-500'
            }>{selectedDifficulty?.toUpperCase()}</span>
          </p>
          <p className="text-sm font-bold uppercase text-zinc-500 mb-8">
            Players in queue: searching...
          </p>
          <button
            onClick={handleCancelMatchmaking}
            className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-3 px-8 text-lg border-4 border-black transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* MATCH FOUND OVERLAY */}
      {queueState === 'matched' && (
        <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-50 p-8 border-4 border-green-500 shadow-[12px_12px_0px_0px_rgba(34,197,94,1)] max-w-2xl h-96 m-auto rounded-none">
          <h2 className="text-4xl font-black uppercase tracking-widest text-green-500 mb-4 animate-bounce">
            Match Found!
          </h2>
          <p className="text-xl font-bold uppercase text-white animate-pulse">
            Loading Arena...
          </p>
        </div>
      )}

      {/* HEADER */}
      <header className="mb-10 border-b-4 border-white pb-6">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Dashboard</h1>
        {stats ? (
          <p className="text-zinc-400 font-bold text-lg">
            Welcome back, <span className="text-white">{stats.username}</span>. Rating: <span className="text-blue-400">{stats.rating}</span> | Matches: <span className="text-purple-400">{stats.matchesCount}</span> | Wins: <span className="text-green-400">{stats.winsCount}</span>
          </p>
        ) : (
          <p className="text-zinc-500 font-bold text-lg animate-pulse">Loading profile and stats...</p>
        )}
      </header>

      {/* CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* QUICK MATCH */}
        <div className="bg-black border-4 border-white p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[12px_12px_0px_0px_rgba(59,130,246,1)] transition-all group duration-300">
          <h2 className="text-2xl font-black uppercase mb-4 text-blue-500">Quick Match</h2>
          <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
            Find an opponent of similar skill level and jump straight into a duel.
          </p>
          <button
            onClick={() => {
              setSelectedDifficulty(null);
              setModalOpen(true);
            }}
            className="w-full text-center bg-white text-black font-black uppercase tracking-widest py-3 border-4 border-black hover:bg-blue-500 hover:text-white transition-colors"
          >
            Find Match
          </button>
        </div>

        {/* LEADERBOARD */}
        <div className="bg-black border-4 border-white p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] opacity-70">
          <h2 className="text-2xl font-black uppercase mb-4 text-purple-500">Leaderboard</h2>
          <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
            See how you stack up against the best coders in the world.
          </p>
          <button className="w-full bg-zinc-800 text-zinc-500 py-3 font-bold uppercase tracking-widest border-4 border-zinc-700 cursor-not-allowed" disabled>
            Coming Soon
          </button>
        </div>

        {/* PRACTICE PROBLEMS */}
        <div className="bg-black border-4 border-white p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[12px_12px_0px_0px_rgba(34,197,94,1)] transition-all group duration-300">
          <h2 className="text-2xl font-black uppercase mb-4 text-green-500">Practice Problems</h2>
          <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
            Browse and solve coding challenges from Codeforces to prepare for your next duel.
          </p>
          <Link
            href="/dashboard/problems"
            className="block w-full text-center bg-white text-black font-black uppercase tracking-widest py-3 border-4 border-black hover:bg-green-500 hover:text-white transition-colors"
          >
            View Problems
          </Link>
        </div>
      </div>

      {/* DIFFICULTY SELECTION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black border-4 border-white p-8 max-w-3xl w-full shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 text-center">
              Select Difficulty
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* EASY CARD */}
              <button
                onClick={() => setSelectedDifficulty('Easy')}
                className={`border-4 p-4 text-center flex flex-col items-center transition-all ${
                  selectedDifficulty === 'Easy' 
                    ? getDifficultyBgSelected('Easy') 
                    : getDifficultyColor('Easy')
                }`}
              >
                <span className="font-black text-xl mb-1 uppercase tracking-widest">Easy</span>
                <span className="font-bold text-sm mb-4">800 - 1000</span>
                <span className="text-xs uppercase tracking-wide opacity-80 text-center">
                  Beginner problems
                </span>
              </button>

              {/* MEDIUM CARD */}
              <button
                onClick={() => setSelectedDifficulty('Medium')}
                className={`border-4 p-4 text-center flex flex-col items-center transition-all ${
                  selectedDifficulty === 'Medium' 
                    ? getDifficultyBgSelected('Medium') 
                    : getDifficultyColor('Medium')
                }`}
              >
                <span className="font-black text-xl mb-1 uppercase tracking-widest">Medium</span>
                <span className="font-bold text-sm mb-4">1100 - 1300</span>
                <span className="text-xs uppercase tracking-wide opacity-80 text-center">
                  Intermediate problems
                </span>
              </button>

              {/* HARD CARD */}
              <button
                onClick={() => setSelectedDifficulty('Hard')}
                className={`border-4 p-4 text-center flex flex-col items-center transition-all ${
                  selectedDifficulty === 'Hard' 
                    ? getDifficultyBgSelected('Hard') 
                    : getDifficultyColor('Hard')
                }`}
              >
                <span className="font-black text-xl mb-1 uppercase tracking-widest">Hard</span>
                <span className="font-bold text-sm mb-4">1400 - 1700</span>
                <span className="text-xs uppercase tracking-wide opacity-80 text-center">
                  Advanced problems
                </span>
              </button>
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-zinc-800 text-zinc-400 hover:text-white font-bold uppercase tracking-widest py-3 px-6 border-2 border-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartMatchmaking}
                disabled={!selectedDifficulty}
                className="bg-white text-black font-black uppercase tracking-widest py-3 px-8 border-4 border-black hover:bg-blue-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Matchmaking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
