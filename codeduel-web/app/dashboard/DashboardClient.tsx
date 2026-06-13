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
    <div className="py-8 px-6 max-w-4xl mx-auto w-full text-neutral-200 relative min-h-[80vh] flex flex-col justify-start">
      {/* MATCHING FULL SCREEN OVERLAY */}
      {queueState === 'searching' && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative overflow-hidden bg-neutral-900 border border-neutral-800/80 rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Spinning/pulsing animation */}
            <div className="relative flex items-center justify-center w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-lg animate-pulse">
                ⚡
              </div>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-white mb-2">
              Finding Opponent...
            </h2>
            <p className="text-neutral-400 text-sm mb-4">
              Searching for players near your matchmaking rating.
            </p>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-950 text-xs text-neutral-400 mb-8 font-medium">
              Difficulty: <span className={`font-semibold ${
                selectedDifficulty === 'Easy' ? 'text-emerald-400' :
                selectedDifficulty === 'Medium' ? 'text-amber-400' : 'text-rose-400'
              }`}>{selectedDifficulty}</span>
            </div>

            <button
              onClick={handleCancelMatchmaking}
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 border border-neutral-700/50 cursor-pointer"
            >
              Cancel Search
            </button>
          </div>
        </div>
      )}

      {/* MATCH FOUND OVERLAY */}
      {queueState === 'matched' && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-emerald-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl mb-6 animate-bounce">
              🤝
            </div>
            <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-wider mb-2">
              Match Found!
            </h2>
            <p className="text-neutral-300 text-sm animate-pulse">
              Preparing coding arena...
            </p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="mb-10 border-b border-neutral-900 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Dashboard</h1>
          {stats ? (
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
              <span className="text-neutral-400 mr-2">Welcome back, <span className="text-white font-semibold">{stats.username}</span></span>
              <div className="flex gap-2 items-center text-xs">
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                  🛡️ {stats.rating}
                </span>
                <span className="bg-neutral-800/80 text-neutral-300 border border-neutral-700/50 px-2.5 py-1 rounded-full font-semibold">
                  ⚔️ {stats.matchesCount} matches
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-semibold">
                  🏆 {stats.winsCount} wins
                </span>
              </div>
            </div>
          ) : (
            <p className="text-neutral-500 text-sm animate-pulse">Loading profile and stats...</p>
          )}
        </div>
      </header>

      {/* CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* QUICK MATCH */}
        <div className="relative overflow-hidden bg-neutral-900/30 border border-neutral-800/80 rounded-2xl p-6 hover:border-amber-500/30 hover:bg-neutral-900/50 transition-all duration-300 group shadow-lg flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-all duration-300" />
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 mb-4 font-bold border border-amber-500/20">
              ⚔️
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2 text-neutral-100 group-hover:text-amber-400 transition-colors">Quick Match</h2>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Find an opponent of similar skill level and jump straight into a 1v1 live coding duel.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedDifficulty(null);
              setModalOpen(true);
            }}
            className="w-full text-center bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md shadow-amber-500/10"
          >
            Find Match
          </button>
        </div>

        {/* PRACTICE PROBLEMS */}
        <div className="relative overflow-hidden bg-neutral-900/30 border border-neutral-800/80 rounded-2xl p-6 hover:border-emerald-500/30 hover:bg-neutral-900/50 transition-all duration-300 group shadow-lg flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-300" />
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 mb-4 font-bold border border-emerald-500/20">
              📝
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2 text-neutral-100 group-hover:text-emerald-400 transition-colors">Practice Problems</h2>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Browse and solve coding challenges from Codeforces to prepare for your next duel.
            </p>
          </div>
          <Link
            href="/dashboard/problems"
            className="block w-full text-center bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 border border-neutral-700/50"
          >
            View Problems
          </Link>
        </div>
      </div>

      {/* DIFFICULTY SELECTION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800/80 p-6 max-w-2xl w-full rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold tracking-tight text-white mb-6 text-center">
              Select Duel Difficulty
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* EASY CARD */}
              <button
                onClick={() => setSelectedDifficulty('Easy')}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all text-center group cursor-pointer ${
                  selectedDifficulty === 'Easy' 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="font-bold text-sm uppercase tracking-wider mb-1">Easy</span>
                <span className="font-semibold text-xs mb-3 opacity-90">800 - 1000</span>
                <span className="text-[11px] leading-relaxed opacity-70">
                  Beginner problems
                </span>
              </button>

              {/* MEDIUM CARD */}
              <button
                onClick={() => setSelectedDifficulty('Medium')}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all text-center group cursor-pointer ${
                  selectedDifficulty === 'Medium' 
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="font-bold text-sm uppercase tracking-wider mb-1">Medium</span>
                <span className="font-semibold text-xs mb-3 opacity-90">1100 - 1300</span>
                <span className="text-[11px] leading-relaxed opacity-70">
                  Intermediate problems
                </span>
              </button>

              {/* HARD CARD */}
              <button
                onClick={() => setSelectedDifficulty('Hard')}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all text-center group cursor-pointer ${
                  selectedDifficulty === 'Hard' 
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400' 
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="font-bold text-sm uppercase tracking-wider mb-1">Hard</span>
                <span className="font-semibold text-xs mb-3 opacity-90">1400 - 1700</span>
                <span className="text-[11px] leading-relaxed opacity-70">
                  Advanced problems
                </span>
              </button>
            </div>

            <div className="flex gap-3 justify-end items-center border-t border-neutral-800/80 pt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleStartMatchmaking}
                disabled={!selectedDifficulty}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-amber-500/10 cursor-pointer"
              >
                Find Opponent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
