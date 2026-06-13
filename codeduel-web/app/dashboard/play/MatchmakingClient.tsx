'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '../../../hooks/useSocket';

interface MatchmakingClientProps {
  userId: string;
  initialRating: number;
  problemId?: string;
}

export default function MatchmakingClient({ userId, initialRating, problemId }: MatchmakingClientProps) {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  
  const [isSearching, setIsSearching] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSearching) {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(timer);
  }, [isSearching]);

  useEffect(() => {
    if (!socket) return;

    socket.on('queue_joined', () => {
      setIsSearching(true);
    });

    socket.on('match_found', (data) => {
      setIsSearching(false);
      router.push(`/arena/${data.roomId}`);
    });

    return () => {
      socket.off('queue_joined');
      socket.off('match_found');
    };
  }, [socket, router]);

  const handleFindMatch = () => {
    if (!socket) return;
    socket.emit('join_queue', { userId, rating: initialRating, problemId });
  };

  const handleCancel = () => {
    if (!socket) return;
    socket.emit('leave_queue');
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center font-mono">
      <div className="max-w-2xl w-full text-center border-4 border-white p-12 shadow-[16px_16px_0px_0px_rgba(255,255,255,1)] bg-black">
        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4">
          Matchmaking
        </h1>
        
        <div className="text-2xl text-zinc-400 mb-12 uppercase tracking-widest font-bold">
          Your Rating: <span className="text-white">{initialRating}</span>
        </div>

        {!isSearching ? (
          <button 
            onClick={handleFindMatch}
            disabled={!isConnected}
            className="w-full bg-white text-black font-black uppercase tracking-widest py-6 text-2xl md:text-3xl hover:bg-zinc-300 transition-colors border-4 border-black disabled:opacity-50"
          >
            {isConnected ? 'Find Match' : 'Connecting...'}
          </button>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-3xl text-blue-400 font-bold mb-4 animate-pulse uppercase tracking-widest">
              Searching...
            </div>
            <div className="text-xl text-zinc-500 font-bold mb-8">
              Elapsed: {elapsedTime}s
            </div>
            <button 
              onClick={handleCancel}
              className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-4 text-xl hover:bg-red-700 transition-colors border-4 border-red-800"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
