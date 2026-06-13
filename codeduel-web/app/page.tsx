import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center p-8 bg-neutral-950 text-center overflow-hidden">
      {/* Subtle Glowing Mesh Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
          ⚡ 1v1 Live Coding Battles
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-6 tracking-tight text-white leading-tight">
          Welcome to <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">CodeDuel</span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-neutral-400 mb-10 max-w-xl leading-relaxed">
          Compete in real-time 1v1 coding challenges. Solve problems, prove your speed, and dominate the arena.
        </p>
        
        <Link 
          href="/dashboard" 
          className="bg-gradient-to-r from-amber-500 to-orange-600 text-black font-extrabold py-3.5 px-10 rounded-full shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.4)] transition-all hover:scale-[1.03] duration-300 text-xs sm:text-sm tracking-widest uppercase"
        >
          Enter the Arena
        </Link>
      </div>
    </div>
  );
}
