'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserStats {
  username: string;
  rating: number;
  matchesCount: number;
  winsCount: number;
}

interface QueryResult {
  query: string;
  columns: string[];
  rows: any[];
  error?: string;
  executionTimeMs?: number;
}

interface ProfileClientProps {
  userId: string;
  memberSince: string;
}

const QUERIES = [
  {
    id: 'leaderboard',
    name: 'Leaderboard by Elo Rating',
    endpoint: '/api/db-queries/leaderboard',
    tables: ['User'],
    sql: `SELECT 
  ROW_NUMBER() OVER (ORDER BY rating DESC) AS rank,
  username,
  rating,
  "matchesWon",
  "matchesLost",
  ROUND("matchesWon"::numeric / 
    NULLIF("matchesWon" + "matchesLost", 0) * 100, 1) AS win_rate_pct
FROM "User"
ORDER BY rating DESC
LIMIT 10`
  },
  {
    id: 'match-history',
    name: 'Match History with Players',
    endpoint: '/api/db-queries/match-history',
    tables: ['Match', 'Problem', 'User'],
    sql: `SELECT 
  SUBSTRING(m.id, 1, 8) AS match_id,
  p.title AS problem,
  p.difficulty,
  u1.username AS player1,
  u2.username AS player2,
  COALESCE(uw.username, 'Ongoing') AS winner,
  m.status,
  COALESCE(
    EXTRACT(EPOCH FROM (m."endTime" - m."startTime"))::INT, 
    0
  ) AS duration_secs
FROM "Match" m
JOIN "Problem"  p  ON p.id = m."problemId"
JOIN "User"     u1 ON u1.id = m."player1Id"
JOIN "User"     u2 ON u2.id = m."player2Id"
LEFT JOIN "User" uw ON uw.id = m."winnerId"
ORDER BY m."startTime" DESC
LIMIT 20`
  },
  {
    id: 'problem-stats',
    name: 'Problem Acceptance Rates',
    endpoint: '/api/db-queries/problem-stats',
    tables: ['Problem', 'Match', 'Submission'],
    sql: `SELECT 
  p.title,
  p.difficulty,
  COUNT(s.id) AS total_submissions,
  SUM(CASE WHEN s.status = 'Accepted' THEN 1 ELSE 0 END) AS accepted,
  ROUND(
    SUM(CASE WHEN s.status = 'Accepted' THEN 1 ELSE 0 END)::numeric 
    / NULLIF(COUNT(s.id), 0) * 100, 1
  ) AS acceptance_rate_pct
FROM "Problem" p
LEFT JOIN "Match" m ON m."problemId" = p.id
LEFT JOIN "Submission" s ON s."matchId" = m.id
GROUP BY p.id, p.title, p.difficulty
ORDER BY total_submissions DESC NULLS LAST`
  },
  {
    id: 'elo-history',
    name: 'Player Elo Standings',
    endpoint: '/api/db-queries/elo-history',
    tables: ['User', 'Match'],
    sql: `SELECT 
  u.username,
  u.rating AS current_rating,
  u."matchesWon",
  u."matchesLost",
  COUNT(m.id) AS total_matches,
  MIN(m."startTime") AS first_match,
  MAX(m."startTime") AS last_match
FROM "User" u
LEFT JOIN "Match" m 
  ON m."player1Id" = u.id OR m."player2Id" = u.id
GROUP BY u.id, u.username, u.rating, u."matchesWon", u."matchesLost"
ORDER BY u.rating DESC`
  },
  {
    id: 'fastest-solutions',
    name: 'Fastest Accepted Solutions',
    endpoint: '/api/db-queries/fastest-solutions',
    tables: ['Submission', 'User', 'Match', 'Problem'],
    sql: `SELECT 
  u.username,
  p.title AS problem,
  p.difficulty,
  s."executionMs",
  TO_CHAR(s."createdAt", 'DD Mon HH24:MI') AS submitted_at
FROM "Submission" s
JOIN "User"    u ON u.id = s."userId"
JOIN "Match"   m ON m.id = s."matchId"
JOIN "Problem" p ON p.id = m."problemId"
WHERE s.status = 'Accepted'
  AND s."executionMs" IS NOT NULL
ORDER BY s."executionMs" ASC
LIMIT 10`
  },
  {
    id: 'triggers',
    name: 'Active Database Triggers',
    endpoint: '/api/db-queries/triggers',
    tables: ['information_schema.triggers'],
    sql: `SELECT 
  trigger_name,
  event_manipulation AS event,
  event_object_table AS table_name,
  action_timing AS timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name`
  }
];

export default function ProfileClient({ userId, memberSince }: ProfileClientProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  // SQL explorer states
  const [collapsedSql, setCollapsedSql] = useState<Record<string, boolean>>({
    leaderboard: true,
    'match-history': true,
    'problem-stats': true,
    'elo-history': true,
    'fastest-solutions': true,
    triggers: true
  });
  const [queryResults, setQueryResults] = useState<Record<string, QueryResult | null>>({});
  const [queryLoading, setQueryLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await fetch('/api/user/rating');
      if (!res.ok) throw new Error('Failed to fetch player stats');
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setStatsError(err.message);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleRunQuery = async (queryId: string, endpoint: string) => {
    const startTime = performance.now();
    setQueryLoading(prev => ({ ...prev, [queryId]: true }));
    setQueryResults(prev => ({ ...prev, [queryId]: null }));

    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      const endTime = performance.now();
      const timeTaken = Math.round(endTime - startTime);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to run query');
      }

      setQueryResults(prev => ({
        ...prev,
        [queryId]: {
          query: data.query,
          columns: data.columns,
          rows: data.rows,
          executionTimeMs: timeTaken
        }
      }));
    } catch (err: any) {
      setQueryResults(prev => ({
        ...prev,
        [queryId]: {
          query: '',
          columns: [],
          rows: [],
          error: err.message
        }
      }));
    } finally {
      setQueryLoading(prev => ({ ...prev, [queryId]: false }));
    }
  };

  const toggleSql = (queryId: string) => {
    setCollapsedSql(prev => ({ ...prev, [queryId]: !prev[queryId] }));
  };

  const highlightSQL = (sql: string) => {
    const tokenRegex = /('[^']*')|\b(SELECT|FROM|JOIN|LEFT|ON|WHERE|ORDER BY|GROUP BY|ORDER|GROUP|BY|LIMIT|DESC|ASC|ROW_NUMBER|OVER|ROUND|NULLIF|COALESCE|EXTRACT|EPOCH|TO_CHAR|AS|AND|OR|CASE|WHEN|THEN|ELSE|END)\b|\b("User"|"Match"|"Problem"|"Submission"|information_schema\.triggers)\b|\b(\d+)\b/g;

    let highlighted = sql.replace(tokenRegex, (match, pStr, pKey, pTab, pNum) => {
      if (pStr) return `<span class="text-emerald-400">${match}</span>`;
      if (pKey) return `<span class="text-amber-500 font-bold">${match}</span>`;
      if (pTab) return `<span class="text-violet-400 font-semibold">${match}</span>`;
      if (pNum) return `<span class="text-sky-400">${match}</span>`;
      return match;
    });

    return <code className="font-mono text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  const formatHeader = (col: string) => {
    return col.replace(/_/g, ' ').toUpperCase();
  };

  const renderBadge = (column: string, value: any) => {
    const stringVal = String(value);
    
    // Difficulty badging
    if (column.toLowerCase() === 'difficulty') {
      if (stringVal === 'Easy') {
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">EASY</span>;
      }
      if (stringVal === 'Medium') {
        return <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">MEDIUM</span>;
      }
      if (stringVal === 'Hard') {
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">HARD</span>;
      }
    }

    // Verdict badging
    if (column.toLowerCase() === 'status') {
      if (stringVal === 'Accepted') {
        return <span className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">ACCEPTED</span>;
      }
      if (stringVal === 'completed') {
        return <span className="bg-sky-500/15 text-sky-400 px-2 py-0.5 rounded text-[10px] font-bold">COMPLETED</span>;
      }
      if (stringVal === 'in_progress') {
        return <span className="bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold">IN PROGRESS</span>;
      }
      return <span className="bg-rose-500/15 text-rose-400 px-2 py-0.5 rounded text-[10px] font-bold">{stringVal.toUpperCase()}</span>;
    }

    // Format timestamps
    if (stringVal.includes('T') && stringVal.includes('Z') && !isNaN(Date.parse(stringVal))) {
      return new Date(stringVal).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
    }

    return stringVal;
  };

  const getTableColor = (table: string) => {
    switch (table) {
      case 'User': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Match': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Problem': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Submission': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      default: return 'bg-neutral-800 text-neutral-400 border-neutral-700/50';
    }
  };

  // Helper to align numbers to the right
  const isNumeric = (val: any) => {
    if (typeof val === 'number') return true;
    if (typeof val === 'string') {
      return !isNaN(val as any) && !isNaN(parseFloat(val));
    }
    return false;
  };

  const memberDate = new Date(memberSince).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const winRate = stats && stats.matchesCount > 0
    ? ((stats.winsCount / stats.matchesCount) * 100).toFixed(1)
    : '0.0';

  const lossesCount = stats ? Math.max(0, stats.matchesCount - stats.winsCount) : 0;
  const usernameLetter = stats?.username ? stats.username.charAt(0).toUpperCase() : 'U';

  return (
    <div className="py-8 px-6 max-w-5xl mx-auto w-full text-neutral-200 flex flex-col gap-10">
      {/* HEADER */}
      <header className="flex items-center gap-4 border-b border-neutral-900 pb-6">
        <Link href="/dashboard" className="text-neutral-400 hover:text-white transition-colors text-sm font-semibold flex items-center gap-1">
          ← Dashboard
        </Link>
        <span className="text-neutral-700">|</span>
        <h1 className="text-2xl font-black tracking-tight text-white">Player Profile</h1>
      </header>

      {/* TOP SECTION — PLAYER CARD */}
      <section className="relative overflow-hidden bg-neutral-900/30 border border-neutral-800/80 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {statsLoading ? (
          <div className="flex flex-col md:flex-row items-center gap-6 animate-pulse">
            <div className="w-20 h-20 bg-neutral-800 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-neutral-800 rounded w-1/4" />
              <div className="h-4 bg-neutral-800 rounded w-1/3" />
            </div>
          </div>
        ) : statsError ? (
          <div className="text-rose-400 font-semibold">{statsError}</div>
        ) : stats ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                {usernameLetter}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{stats.username}</h2>
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-0.5 rounded-full text-xs font-black tracking-wider flex items-center gap-1 shadow-sm">
                    {stats.rating} ★
                  </span>
                </div>
                <p className="text-neutral-500 text-xs">Member since {memberDate}</p>
              </div>
            </div>

            <div className="flex-1 max-w-sm">
              <div className="flex justify-between items-center mb-2 text-xs font-bold text-neutral-400">
                <span>WIN RATE</span>
                <span className="text-emerald-400">{winRate}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-850 rounded-full overflow-hidden border border-neutral-800">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                  style={{ width: `${winRate}%` }} 
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-6 text-center shrink-0">
              <div className="bg-neutral-950/60 border border-neutral-800/80 px-4 py-2.5 rounded-xl min-w-[80px]">
                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-wider mb-1">Played</div>
                <div className="text-xl font-bold text-white leading-none">{stats.matchesCount}</div>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/20 px-4 py-2.5 rounded-xl min-w-[80px]">
                <div className="text-emerald-500/70 text-[10px] font-black uppercase tracking-wider mb-1">Wins</div>
                <div className="text-xl font-bold text-emerald-400 leading-none">{stats.winsCount}</div>
              </div>
              <div className="bg-rose-500/5 border border-rose-500/20 px-4 py-2.5 rounded-xl min-w-[80px]">
                <div className="text-rose-500/70 text-[10px] font-black uppercase tracking-wider mb-1">Losses</div>
                <div className="text-xl font-bold text-rose-400 leading-none">{lossesCount}</div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* BOTTOM SECTION — DB EXPLORER */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
            <span>🗄️</span> Database Explorer
          </h2>
          <p className="text-neutral-500 text-xs mt-1">Live SQL queries running directly against PostgreSQL database</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {QUERIES.map(q => {
            const result = queryResults[q.id];
            const loading = queryLoading[q.id];
            const showSql = !collapsedSql[q.id];

            return (
              <div key={q.id} className="bg-neutral-900/20 border border-neutral-850 rounded-2xl overflow-hidden shadow-lg hover:border-neutral-800 transition-colors">
                {/* QUERY HEADER */}
                <div className="px-5 py-4 border-b border-neutral-850 flex flex-wrap items-center justify-between gap-4 bg-neutral-950/20">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-sm text-neutral-100">{q.name}</h3>
                    <div className="flex gap-1.5">
                      {q.tables.map(table => (
                        <span 
                          key={table} 
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getTableColor(table)}`}
                        >
                          {table}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleSql(q.id)}
                      className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showSql ? 'Hide SQL' : 'Show SQL'}
                    </button>
                    <button
                      onClick={() => handleRunQuery(q.id, q.endpoint)}
                      disabled={loading}
                      className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1 shadow-sm shadow-emerald-500/10"
                    >
                      <span>▶</span> Run Query
                    </button>
                  </div>
                </div>

                {/* COLLAPSIBLE SQL */}
                {showSql && (
                  <div className="bg-neutral-950 p-4 border-b border-neutral-850 overflow-x-auto">
                    <pre className="text-neutral-400 select-all leading-relaxed whitespace-pre font-mono">
                      {highlightSQL(q.sql)}
                    </pre>
                  </div>
                )}

                {/* RESULTS AREA */}
                <div className="p-5">
                  {loading ? (
                    <div className="space-y-3 animate-pulse py-4">
                      <div className="h-4 bg-neutral-800 rounded w-1/3" />
                      <div className="h-8 bg-neutral-800 rounded" />
                      <div className="h-8 bg-neutral-800 rounded" />
                      <div className="h-8 bg-neutral-800 rounded" />
                    </div>
                  ) : result ? (
                    result.error ? (
                      <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-xs font-semibold">
                        ⚠️ Error executing query: {result.error}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {/* DATA TABLE */}
                        <div className="overflow-x-auto border border-neutral-850 rounded-xl bg-neutral-950/10">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-neutral-850 bg-neutral-950/40 text-neutral-400 font-bold uppercase tracking-wider">
                                {result.columns.map(col => (
                                  <th 
                                    key={col} 
                                    className={`px-4 py-3 font-semibold ${
                                      result.rows.length > 0 && isNumeric(result.rows[0][col]) ? 'text-right' : ''
                                    }`}
                                  >
                                    {formatHeader(col)}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-850/50">
                              {result.rows.length === 0 ? (
                                <tr>
                                  <td colSpan={result.columns.length} className="px-4 py-6 text-center text-neutral-500 italic">
                                    Query returned 0 rows
                                  </td>
                                </tr>
                              ) : (
                                result.rows.map((row, idx) => (
                                  <tr key={idx} className="hover:bg-neutral-800/10 transition-colors odd:bg-neutral-900/5">
                                    {result.columns.map(col => {
                                      const val = row[col];
                                      return (
                                        <td 
                                          key={col} 
                                          className={`px-4 py-3 font-medium ${
                                            isNumeric(val) ? 'text-right font-mono text-neutral-300' : 'text-neutral-400'
                                          }`}
                                        >
                                          {renderBadge(col, val)}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* METADATA */}
                        <div className="flex justify-between items-center text-[10px] text-neutral-500 uppercase font-black tracking-wider px-1">
                          <span>Showing {result.rows.length} rows</span>
                          <span>
                            Executed in <span className="text-emerald-400">{result.executionTimeMs}ms</span>
                          </span>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 text-neutral-500 text-xs italic border border-dashed border-neutral-800 rounded-xl">
                      Click "Run Query" to execute against PostgreSQL
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
