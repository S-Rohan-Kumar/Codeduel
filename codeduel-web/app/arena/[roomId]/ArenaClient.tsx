'use client';

import { useReducer, useEffect, useRef } from 'react';
import { useSocket } from '../../../hooks/useSocket';
import Editor from '@monaco-editor/react';
import CFMathText from '../../../components/CFMathText';

interface ArenaState {
  code: string;
  language: string;
  timeLeft: number | null;
  submissionStatus: "idle" | "running" | "accepted" | "wrong_answer" | "tle" | "error";
  opponentStatus: "coding" | "submitted" | "accepted" | "waiting";
  matchOver: { winnerId: string | null, reason: string } | null;
  problem: any | null;
  matchId: string | null;
  lastVerdict: string | null;
  testPanelOpen: boolean;
  testActiveTab: 'samples' | 'custom';
  samples: { input: string; expectedOutput: string }[];
  sampleResults: { stdout: string; stderr: string; exitCode: number; passed: boolean; actualOutput?: string; compileError?: string | null }[];
  customInput: string;
  customOutput: { stdout: string; stderr: string; exitCode: number } | null;
  testingStatus: 'idle' | 'running';
}

type Action = 
  | { type: 'SET_CODE', payload: string }
  | { type: 'SET_LANGUAGE', payload: string }
  | { type: 'TICK' }
  | { type: 'SET_TIME_LEFT', payload: number }
  | { type: 'SET_SUBMISSION_STATUS', payload: ArenaState['submissionStatus'] }
  | { type: 'SET_OPPONENT_STATUS', payload: ArenaState['opponentStatus'] }
  | { type: 'MATCH_OVER', payload: { winnerId: string | null, reason: string } }
  | { type: 'ROOM_READY', payload: { problem: any, timeLimit: number, matchId: string } }
  | { type: 'SET_VERDICT', payload: string | null }
  | { type: 'TOGGLE_TEST_PANEL' }
  | { type: 'SET_TEST_TAB', payload: 'samples' | 'custom' }
  | { type: 'SET_SAMPLES', payload: any[] }
  | { type: 'SET_SAMPLE_RESULTS', payload: any[] }
  | { type: 'SET_CUSTOM_INPUT', payload: string }
  | { type: 'SET_CUSTOM_OUTPUT', payload: any }
  | { type: 'SET_TESTING_STATUS', payload: 'idle' | 'running' };

const TEMPLATES: Record<string, string> = {
  python: `def solve():
    # Write your solution here
    pass

if __name__ == '__main__':
    solve()
`
};


const initialState: ArenaState = {
  code: TEMPLATES.python,
  language: 'python',
  timeLeft: null,
  submissionStatus: 'idle',
  opponentStatus: 'waiting',
  matchOver: null,
  problem: null,
  matchId: null,
  lastVerdict: null,
  testPanelOpen: false,
  testActiveTab: 'samples',
  samples: [],
  sampleResults: [],
  customInput: '',
  customOutput: null,
  testingStatus: 'idle'
};

function arenaReducer(state: ArenaState, action: Action): ArenaState {
  switch (action.type) {
    case 'SET_CODE': return { ...state, code: action.payload };
    case 'SET_LANGUAGE': {
      const newLang = action.payload;
      let newCode = state.code;
      const isUnmodified = state.code === '// Write your solution here...' || Object.values(TEMPLATES).includes(state.code);
      if (isUnmodified) {
        newCode = TEMPLATES[newLang];
      }
      return { ...state, language: newLang, code: newCode };
    }
    case 'TICK': return { ...state, timeLeft: state.timeLeft ? state.timeLeft - 1 : 0 };
    case 'SET_TIME_LEFT': return { ...state, timeLeft: action.payload };
    case 'SET_SUBMISSION_STATUS': return { ...state, submissionStatus: action.payload };
    case 'SET_OPPONENT_STATUS': return { ...state, opponentStatus: action.payload };
    case 'MATCH_OVER': return { ...state, matchOver: action.payload };
    case 'ROOM_READY': return { 
      ...state, 
      problem: action.payload.problem, 
      timeLeft: action.payload.timeLimit,
      matchId: action.payload.matchId,
      opponentStatus: 'coding'
    };
    case 'SET_VERDICT': return { ...state, lastVerdict: action.payload };
    case 'TOGGLE_TEST_PANEL': return { ...state, testPanelOpen: !state.testPanelOpen };
    case 'SET_TEST_TAB': return { ...state, testActiveTab: action.payload };
    case 'SET_SAMPLES': return { ...state, samples: action.payload };
    case 'SET_SAMPLE_RESULTS': return { ...state, sampleResults: action.payload };
    case 'SET_CUSTOM_INPUT': return { ...state, customInput: action.payload };
    case 'SET_CUSTOM_OUTPUT': return { ...state, customOutput: action.payload };
    case 'SET_TESTING_STATUS': return { ...state, testingStatus: action.payload };
    default: return state;
  }
}

export default function ArenaClient({ roomId, userId }: { roomId: string, userId: string }) {
  const { socket, isConnected } = useSocket();

  const [state, dispatch] = useReducer(arenaReducer, initialState);
  const lastSubmitTime = useRef<number>(0);
  const lastFetchResponseTime = useRef<number>(0);
  
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    socket.emit('join_room', { roomId, userId });

    socket.on('room_ready', async (data) => {
      dispatch({ type: 'ROOM_READY', payload: data });
      try {
        const res = await fetch(`/api/samples?matchId=${data.matchId}`);
        const result = await res.json();
        if (result.samples) {
          dispatch({ type: 'SET_SAMPLES', payload: result.samples });
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('opponent_status', (status) => {
      dispatch({ type: 'SET_OPPONENT_STATUS', payload: status });
    });

    socket.on('match_over', (data) => {
      const currentUserId = userId;
      console.log('[ARENA SOCKET] match result received:', data);
      console.log('[ARENA SOCKET] my userId:', currentUserId);
      console.log('[ARENA SOCKET] winnerId in event:', data.winnerId);
      console.log('[ARENA SOCKET] am I winner?', data.winnerId === currentUserId);

      // If we already got VICTORY from the fetch response, skip the socket event.
      // This prevents the socket from overwriting our own VICTORY with a comparison
      // that might fail due to ID format mismatches.
      if (lastFetchResponseTime.current >= lastSubmitTime.current && lastSubmitTime.current > 0) {
        console.log('[ARENA SOCKET] ignoring match_over — fetch already resolved our verdict as VICTORY');
        // Still dispatch so the opponent's side gets the overlay via their own socket event.
        // But only dispatch if we haven't already set matchOver from the fetch path.
        return;
      }

      // We are the OPPONENT (loser) — only socket can tell us we lost.
      console.log('[ARENA SOCKET] dispatching MATCH_OVER (we are the opponent/loser)');
      dispatch({ type: 'MATCH_OVER', payload: data });
    });

    socket.on('verdict', (data: any) => {
      const timeSinceSubmit = Date.now() - lastSubmitTime.current;
      if (timeSinceSubmit < 2000) {
        console.log('[SOCKET] Ignoring socket verdict event (preferring fresh fetch response):', data);
        return;
      }
      if (lastFetchResponseTime.current >= lastSubmitTime.current) {
        console.log('[SOCKET] Ignoring socket verdict event (already received fresh fetch response):', data);
        return;
      }
      console.log('[SOCKET] Received socket verdict event:', data);
      dispatch({ type: 'SET_VERDICT', payload: data.verdict || data.error });
    });

    return () => {
      socket.off('room_ready');
      socket.off('opponent_status');
      socket.off('match_over');
      socket.off('verdict');
    };
  }, [socket, isConnected, roomId, userId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.timeLeft !== null && state.timeLeft > 0 && !state.matchOver) {
      interval = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    }
    return () => clearInterval(interval);
  }, [state.timeLeft, state.matchOver]);

  const handleRunTests = async () => {
    dispatch({ type: 'SET_TESTING_STATUS', payload: 'running' });
    dispatch({ type: 'SET_SAMPLE_RESULTS', payload: [] });
    dispatch({ type: 'SET_CUSTOM_OUTPUT', payload: null });
    if (!state.testPanelOpen) {
      dispatch({ type: 'TOGGLE_TEST_PANEL' });
    }
    
    try {
      if (state.testActiveTab === 'samples') {
        const samplesRes = await fetch(`/api/samples?matchId=${state.matchId}`);
        const samplesData = await samplesRes.json();
        const samplesList = samplesData.samples || [];

        dispatch({ type: 'SET_SAMPLES', payload: samplesList });

        const results = [];
        const normalise = (s: string) =>
          s.trim().split(/\r?\n/).map((l: string) => l.trim()).filter((l: string) => l !== '').join('\n');

        for (let i = 0; i < samplesList.length; i++) {
          const sample = samplesList[i];
          const runRes = await fetch('/api/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: state.code,
              language: 'python',
              stdin: sample.input
            })
          });
          const runResult = await runRes.json();
          console.log('[SAMPLE TEST] raw response for TC:', i, JSON.stringify(runResult));

          const actualOutput = runResult.stdout ?? '';
          const expectedOutput = sample.expectedOutput || '';

          const passed = expectedOutput === 'CUSTOM_VALIDATED'
            ? runResult.exitCode === 0
            : (runResult.exitCode === 0 && normalise(actualOutput) === normalise(expectedOutput));

          results.push({
            input: sample.input,
            expectedOutput: sample.expectedOutput,
            stdout: runResult.stdout ?? '',
            stderr: runResult.stderr ?? '',
            exitCode: runResult.exitCode ?? 1,
            compileError: runResult.compileError ?? null,
            passed: passed
          });
        }
        dispatch({ type: 'SET_SAMPLE_RESULTS', payload: results });
        dispatch({ type: 'SET_TEST_TAB', payload: 'samples' });
      } else {
        const res = await fetch('/api/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: state.code,
            language: state.language,
            stdin: state.customInput
          })
        });
        const data = await res.json();
        dispatch({ type: 'SET_CUSTOM_OUTPUT', payload: data });
      }
    } catch (err) {
      console.error(err);
    } finally {
      dispatch({ type: 'SET_TESTING_STATUS', payload: 'idle' });
    }
  };

  const handleSubmit = async () => {
    if (!socket || !state.matchId) return;
    
    lastSubmitTime.current = Date.now();
    lastFetchResponseTime.current = 0;
    dispatch({ type: 'SET_SUBMISSION_STATUS', payload: 'running' });
    dispatch({ type: 'SET_VERDICT', payload: null });
    socket.emit('submit_attempt', { roomId, userId, status: 'submitted' });
    
    // Map languages to Judge0 IDs
    let languageId = 71; // Python

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: state.matchId,
          userId,
          code: state.code,
          languageId,
          roomId
        })
      });

      const data = await res.json();
      console.log('[SUBMIT] fetch response:', JSON.stringify(data));

      // Mark fetch as done — socket match_over handler will see this and skip
      lastFetchResponseTime.current = Date.now();

      if (data.verdict === 'Accepted') {
        console.log('[SUBMIT] Accepted — processing verdict and match status:', data);
        dispatch({ type: 'SET_VERDICT', payload: 'Accepted' });
        dispatch({ type: 'SET_SUBMISSION_STATUS', payload: 'accepted' });

        const winnerId = data.matchCompleted && data.winnerId && data.winnerId !== userId 
          ? data.winnerId 
          : userId;
        
        const reason = winnerId === userId ? 'solved' : 'opponent_solved';
        
        dispatch({ type: 'MATCH_OVER', payload: { winnerId, reason } });
        
        if (winnerId === userId) {
          socket.emit('submit_attempt', { roomId, userId, status: 'accepted' });
        } else {
          socket.emit('submit_attempt', { roomId, userId, status: 'coding' });
        }
      } else {
        // Wrong Answer / RE / TLE — show inline verdict banner, stay in arena
        console.log('[SUBMIT] Non-accepted verdict:', data.verdict);
        dispatch({ type: 'SET_VERDICT', payload: data.verdict || data.error });
        dispatch({ type: 'SET_SUBMISSION_STATUS', payload: 'wrong_answer' });
        
        if (data.matchCompleted && data.winnerId) {
          console.log('[SUBMIT] Match already completed by winner:', data.winnerId);
          dispatch({ type: 'MATCH_OVER', payload: { winnerId: data.winnerId, reason: 'opponent_solved' } });
        } else {
          socket.emit('submit_attempt', { roomId, userId, status: 'coding' });
        }
        // Reset so future socket match_over events (opponent solved) are NOT ignored
        lastFetchResponseTime.current = 0;
      }

    } catch (err) {
      dispatch({ type: 'SET_SUBMISSION_STATUS', payload: 'error' });
      dispatch({ type: 'SET_VERDICT', payload: 'Network Error' });
      socket.emit('submit_attempt', { roomId, userId, status: 'coding' });
      lastFetchResponseTime.current = 0;
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!state.problem) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-2xl uppercase font-black tracking-widest animate-pulse">Waiting for opponent...</div>;
  }

  const isLowTime = state.timeLeft !== null && state.timeLeft <= 60;

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-neutral-950 text-neutral-200 flex flex-col overflow-hidden">
      <header className="h-14 border-b border-neutral-900 flex justify-between items-center px-6 shrink-0 bg-neutral-950">
        <div className="font-semibold text-neutral-400 text-xs tracking-wider uppercase truncate w-1/3">
          Room: <span className="text-white font-mono">{roomId.slice(0, 8)}</span>
        </div>
        <div className={`text-2xl font-black tracking-tight w-1/3 text-center ${isLowTime ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
          {state.timeLeft !== null ? formatTime(state.timeLeft) : '--:--'}
        </div>
        <div className="text-xs uppercase tracking-wider text-right w-1/3 flex justify-end">
          <span className="bg-neutral-900 border border-neutral-800 text-neutral-400 px-3 py-1 rounded-full font-semibold">
            Opponent: <span className={
              state.opponentStatus === 'submitted' ? 'text-amber-400' :
              state.opponentStatus === 'accepted' ? 'text-emerald-400' : 'text-indigo-400'
            }>{state.opponentStatus}</span>
          </span>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <div className="w-[60%] flex flex-col border-r border-neutral-900 min-h-0 bg-[#1e1e1e]">
          <div className={`flex-1 min-h-0 ${state.testPanelOpen ? '' : 'h-full'}`}>
            <Editor
              height="100%"
              theme="vs-dark"
              language={state.language}
              value={state.code}
              onChange={(val) => dispatch({ type: 'SET_CODE', payload: val || '' })}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: '"JetBrains Mono", monospace',
                padding: { top: 12 }
              }}
            />
          </div>

          {state.testPanelOpen && (
            <div className="h-[42%] border-t border-neutral-900 bg-neutral-950 flex flex-col text-sm min-h-0 overflow-hidden">
              <div className="flex border-b border-neutral-900 bg-neutral-900/40 shrink-0">
                <button
                  className={`px-4 py-2 font-semibold text-xs uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                    state.testActiveTab === 'samples' 
                      ? 'border-amber-500 text-white bg-neutral-900/20' 
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                  onClick={() => dispatch({ type: 'SET_TEST_TAB', payload: 'samples' })}
                >
                  Sample Tests
                </button>
                <button
                  className={`px-4 py-2 font-semibold text-xs uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                    state.testActiveTab === 'custom' 
                      ? 'border-amber-500 text-white bg-neutral-900/20' 
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                  onClick={() => dispatch({ type: 'SET_TEST_TAB', payload: 'custom' })}
                >
                  Custom Input
                </button>
                <button
                  className="px-4 py-2 font-semibold text-xs uppercase tracking-wider text-neutral-500 hover:text-neutral-300 ml-auto cursor-pointer"
                  onClick={() => dispatch({ type: 'TOGGLE_TEST_PANEL' })}
                >
                  Close
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 bg-neutral-950">
                {state.testingStatus === 'running' && (
                  <div className="text-amber-500 animate-pulse text-xs font-semibold uppercase tracking-wider mb-4">Running tests...</div>
                )}
                
                {state.testActiveTab === 'samples' && (
                  <div className="flex flex-col gap-4">
                    {state.samples.map((sample, idx) => {
                      const res = state.sampleResults[idx];
                      let outputText = '';
                      let outputClassName = 'bg-neutral-900 text-neutral-300';

                      if (res) {
                        if (res.compileError) {
                          outputText = res.compileError;
                          outputClassName = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                        } else if (res.stderr === 'Piston server unreachable') {
                          outputText = 'Piston server unreachable';
                          outputClassName = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                        } else if (res.exitCode !== 0) {
                          outputText = `${res.stderr}\nExit code: ${res.exitCode}`;
                          outputClassName = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                        } else if (res.stdout === '') {
                          outputText = `(No Output — exit code: ${res.exitCode})`;
                          outputClassName = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                        } else {
                          outputText = res.stdout;
                          outputClassName = res.passed 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-neutral-905 text-neutral-300 border border-neutral-800';
                        }
                      }

                      return (
                        <div key={idx} className="border border-neutral-900 rounded-xl p-4 bg-neutral-900/10">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-xs text-neutral-400">Test Case {idx + 1}</span>
                            {res && (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                res.passed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                              }`}>
                                {res.passed ? 'PASS' : 'FAIL'}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-neutral-500 text-[10px] font-bold mb-1">INPUT</div>
                              <pre className="bg-neutral-900/60 border border-neutral-900 p-2 text-neutral-300 font-mono text-[11px] rounded-lg overflow-x-auto select-all">{sample.input}</pre>
                            </div>
                            <div>
                              <div className="text-neutral-500 text-[10px] font-bold mb-1">EXPECTED</div>
                              <pre className="bg-neutral-900/60 border border-neutral-900 p-2 text-neutral-300 font-mono text-[11px] rounded-lg overflow-x-auto select-all">
                                {sample.expectedOutput === 'CUSTOM_VALIDATED' ? 'Custom Validated' : sample.expectedOutput}
                              </pre>
                            </div>
                          </div>
                          
                          {res && (
                            <div className="mt-3">
                              <div className="text-neutral-500 text-[10px] font-bold mb-1">OUTPUT</div>
                              <pre className={`p-2 font-mono text-[11px] rounded-lg overflow-x-auto select-all ${outputClassName}`}>
                                {outputText}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {state.testActiveTab === 'custom' && (
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <div className="text-neutral-500 text-[10px] font-bold mb-1">STDIN</div>
                      <textarea 
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-neutral-300 font-mono text-xs h-24 outline-none focus:border-neutral-700 transition-colors"
                        value={state.customInput}
                        onChange={(e) => dispatch({ type: 'SET_CUSTOM_INPUT', payload: e.target.value })}
                        placeholder={"Enter input in CF format:\nLine 1: number of test cases (t)\nThen input for each test case"}
                      />
                      <p className="text-neutral-500 text-xs mt-1">
                        For Course Wishes: first line is t, then n k, then capacities, then wish levels
                      </p>
                    </div>
                    
                    {state.customOutput && (
                      <div className="mt-2">
                        <div className="text-neutral-500 text-[10px] font-bold mb-1">STDOUT / STDERR</div>
                        <pre className="bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-neutral-300 font-mono text-xs overflow-x-auto">
                          {state.customOutput.stdout || state.customOutput.stderr || '(No Output)'}
                        </pre>
                        {state.customOutput.exitCode !== 0 && (
                          <div className="text-rose-500 text-xs mt-1">Exited with code {state.customOutput.exitCode}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-[40%] bg-neutral-950 overflow-y-auto p-6 relative flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-white mb-3">{state.problem.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-6 text-xs font-semibold">
            <span className={`px-2.5 py-0.5 rounded-full ${
              state.problem.difficulty.toLowerCase() === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              state.problem.difficulty.toLowerCase() === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {state.problem.difficulty}
            </span>
            <span className="bg-neutral-900 border border-neutral-800 text-neutral-400 px-2.5 py-0.5 rounded-full">
              ⏱️ {state.problem.timeLimit}s
            </span>
            <span className="bg-neutral-900 border border-neutral-800 text-neutral-400 px-2.5 py-0.5 rounded-full">
              💾 {state.problem.memoryLimit}MB
            </span>
          </div>

          <div className="prose prose-invert max-w-none text-neutral-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
            <CFMathText text={state.problem.description} />
          </div>

          {state.lastVerdict && !state.matchOver && (
            <div className={`border rounded-xl p-4 text-center mt-6 font-bold uppercase tracking-wider text-sm animate-in slide-in-from-bottom-2 ${
              state.lastVerdict === 'Accepted' 
                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5 shadow-md shadow-emerald-500/5' 
                : 'border-rose-500/30 text-rose-400 bg-rose-500/5 shadow-md shadow-rose-500/5'
            }`}>
              Verdict: {state.lastVerdict}
            </div>
          )}

          {state.matchOver && (
            <div className="absolute inset-0 bg-neutral-955/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in duration-300">
              <div className="max-w-md w-full bg-neutral-900 border border-neutral-805 rounded-2xl p-8 shadow-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-6 ${
                  state.matchOver.winnerId === userId ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  state.matchOver.winnerId === null ? 'bg-neutral-800 text-neutral-400 border border-neutral-700' :
                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {state.matchOver.winnerId === userId ? '🏆' : state.matchOver.winnerId === null ? '🤝' : '💀'}
                </div>
                
                <h2 className={`text-3xl font-black uppercase tracking-wider mb-2 ${
                  state.matchOver.winnerId === userId ? 'text-emerald-400' : 
                  state.matchOver.winnerId === null ? 'text-neutral-400' : 'text-rose-400'
                }`}>
                  {state.matchOver.winnerId === userId ? 'Victory' : state.matchOver.winnerId === null ? 'Draw' : 'Defeat'}
                </h2>
                
                <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold mb-8">
                  {state.matchOver.reason.replace('_', ' ')}
                </p>
                
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full text-center bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md shadow-amber-500/10"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="h-14 border-t border-neutral-905 flex justify-between items-center px-6 shrink-0 bg-neutral-955">
        <select 
          className="bg-neutral-900 text-neutral-350 font-semibold text-xs border border-neutral-800 rounded-lg py-1.5 px-3 outline-none hover:border-neutral-700 transition-all cursor-pointer"
          value={state.language}
          onChange={(e) => dispatch({ type: 'SET_LANGUAGE', payload: e.target.value })}
        >
          <option value="python">Python 3</option>
        </select>

        <div className="flex gap-3">
          <button 
            onClick={handleRunTests}
            disabled={state.testingStatus === 'running'}
            className="border border-neutral-800 hover:border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-355 hover:text-white font-bold py-1.5 px-4 rounded-lg text-xs uppercase tracking-wider transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            Run Tests
          </button>
          <button 
            onClick={handleSubmit}
            disabled={state.submissionStatus === 'running' || !!state.matchOver}
            className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold py-1.5 px-6 rounded-lg text-xs uppercase tracking-wider transition-all duration-200 disabled:opacity-50 min-w-[140px] cursor-pointer shadow-md shadow-amber-500/10"
          >
            {state.submissionStatus === 'running' ? 'Running...' : 'Submit'}
          </button>
        </div>
      </footer>
    </div>
  );
}
