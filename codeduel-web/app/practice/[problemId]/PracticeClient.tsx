'use client';

import { useReducer, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import CFMathText from '../../../components/CFMathText';
import Link from 'next/link';

interface PracticeState {
  code: string;
  language: string;
  submissionStatus: "idle" | "running" | "accepted" | "wrong_answer" | "tle" | "error";
  problem: any | null;
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
  | { type: 'SET_SUBMISSION_STATUS', payload: PracticeState['submissionStatus'] }
  | { type: 'SET_PROBLEM', payload: any }
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

const initialState: PracticeState = {
  code: TEMPLATES.python,
  language: 'python',
  submissionStatus: 'idle',
  problem: null,
  lastVerdict: null,
  testPanelOpen: false,
  testActiveTab: 'samples',
  samples: [],
  sampleResults: [],
  customInput: '',
  customOutput: null,
  testingStatus: 'idle'
};

function practiceReducer(state: PracticeState, action: Action): PracticeState {
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
    case 'SET_SUBMISSION_STATUS': return { ...state, submissionStatus: action.payload };
    case 'SET_PROBLEM': return { ...state, problem: action.payload };
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

export default function PracticeClient({ problemId, userId }: { problemId: string, userId: string }) {
  const [state, dispatch] = useReducer(practiceReducer, initialState);

  useEffect(() => {
    async function loadData() {
      try {
        const probRes = await fetch(`/api/problems/${problemId}`);
        const probResult = await probRes.json();
        if (probResult.problem) {
          dispatch({ type: 'SET_PROBLEM', payload: probResult.problem });
        }

        const samplesRes = await fetch(`/api/samples?problemId=${problemId}`);
        const samplesResult = await samplesRes.json();
        if (samplesResult.samples) {
          dispatch({ type: 'SET_SAMPLES', payload: samplesResult.samples });
        }
      } catch (err) {
        console.error('Error loading practice problem data:', err);
      }
    }
    loadData();
  }, [problemId]);

  const handleRunTests = async () => {
    dispatch({ type: 'SET_TESTING_STATUS', payload: 'running' });
    dispatch({ type: 'SET_SAMPLE_RESULTS', payload: [] });
    dispatch({ type: 'SET_CUSTOM_OUTPUT', payload: null });
    if (!state.testPanelOpen) {
      dispatch({ type: 'TOGGLE_TEST_PANEL' });
    }
    
    try {
      if (state.testActiveTab === 'samples') {
        const samplesRes = await fetch(`/api/samples?problemId=${problemId}`);
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
              language: state.language,
              stdin: sample.input
            })
          });
          const runResult = await runRes.json();

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
    dispatch({ type: 'SET_SUBMISSION_STATUS', payload: 'running' });
    dispatch({ type: 'SET_VERDICT', payload: null });

    try {
      const res = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId,
          code: state.code,
          language: state.language
        })
      });

      const data = await res.json();
      dispatch({ type: 'SET_VERDICT', payload: data.verdict || data.error });
      dispatch({ type: 'SET_SUBMISSION_STATUS', payload: data.verdict === 'Accepted' ? 'accepted' : 'wrong_answer' });
    } catch (err) {
      dispatch({ type: 'SET_SUBMISSION_STATUS', payload: 'error' });
      dispatch({ type: 'SET_VERDICT', payload: 'Network Error' });
    }
  };

  if (!state.problem) {
    return <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center text-sm font-semibold tracking-wider animate-pulse">Loading problem...</div>;
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-neutral-950 text-neutral-200 flex flex-col overflow-hidden">
      <header className="h-14 border-b border-neutral-900 flex justify-between items-center px-6 shrink-0 bg-neutral-950">
        <div className="font-bold text-white text-sm tracking-tight truncate w-2/3">
          Practice: <span className="text-neutral-400 font-medium">{state.problem.title}</span>
        </div>
        <Link 
          href="/dashboard/problems"
          className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white font-bold px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer"
        >
          ← Back
        </Link>
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

          {state.lastVerdict && (
            <div className={`border rounded-xl p-4 text-center mt-6 font-bold uppercase tracking-wider text-sm animate-in slide-in-from-bottom-2 ${
              state.lastVerdict === 'Accepted' 
                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5 shadow-md shadow-emerald-500/5' 
                : 'border-rose-500/30 text-rose-400 bg-rose-500/5 shadow-md shadow-rose-500/5'
            }`}>
              Verdict: {state.lastVerdict}
            </div>
          )}
        </div>
      </div>

      <footer className="h-14 border-t border-neutral-900 flex justify-between items-center px-6 shrink-0 bg-neutral-950">
        <select 
          className="bg-neutral-900 text-neutral-300 font-semibold text-xs border border-neutral-800 rounded-lg py-1.5 px-3 outline-none hover:border-neutral-700 transition-all cursor-pointer"
          value={state.language}
          onChange={(e) => dispatch({ type: 'SET_LANGUAGE', payload: e.target.value })}
        >
          <option value="python">Python 3</option>
        </select>

        <div className="flex gap-3">
          <button 
            onClick={handleRunTests}
            disabled={state.testingStatus === 'running'}
            className="border border-neutral-800 hover:border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-350 hover:text-white font-bold py-1.5 px-4 rounded-lg text-xs uppercase tracking-wider transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            Run Tests
          </button>
          <button 
            onClick={handleSubmit}
            disabled={state.submissionStatus === 'running'}
            className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold py-1.5 px-6 rounded-lg text-xs uppercase tracking-wider transition-all duration-200 disabled:opacity-50 min-w-[140px] cursor-pointer shadow-md shadow-amber-500/10"
          >
            {state.submissionStatus === 'running' ? 'Running...' : 'Submit'}
          </button>
        </div>
      </footer>
    </div>
  );
}
