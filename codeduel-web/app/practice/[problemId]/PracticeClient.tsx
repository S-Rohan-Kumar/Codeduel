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
    return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-2xl uppercase font-black tracking-widest animate-pulse">Loading problem...</div>;
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col font-mono overflow-hidden">
      <header className="h-16 border-b-4 border-white flex justify-between items-center px-6 shrink-0 bg-black">
        <div className="font-bold text-white text-lg uppercase tracking-widest truncate w-2/3">
          PRACTICE: {state.problem.title}
        </div>
        <Link 
          href="/dashboard/problems"
          className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-widest border-2 border-white py-1 px-4 text-sm"
        >
          ← Back
        </Link>
      </header>

      <div className="flex-1 flex min-h-0">
        <div className="w-[60%] flex flex-col border-r-4 border-white min-h-0 bg-[#1e1e1e]">
          <div className={`flex-1 min-h-0 ${state.testPanelOpen ? '' : 'h-full'}`}>
            <Editor
              height="100%"
              theme="vs-dark"
              language={state.language}
              value={state.code}
              onChange={(val) => dispatch({ type: 'SET_CODE', payload: val || '' })}
              options={{
                minimap: { enabled: false },
                fontSize: 16,
                fontFamily: '"JetBrains Mono", monospace',
                padding: { top: 16 }
              }}
            />
          </div>

          {state.testPanelOpen && (
            <div className="h-[40%] border-t-4 border-white bg-black flex flex-col text-sm min-h-0 overflow-hidden">
              <div className="flex border-b-2 border-zinc-800 bg-zinc-900 shrink-0">
                <button
                  className={`px-4 py-2 font-bold tracking-widest uppercase ${state.testActiveTab === 'samples' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
                  onClick={() => dispatch({ type: 'SET_TEST_TAB', payload: 'samples' })}
                >
                  Sample Tests
                </button>
                <button
                  className={`px-4 py-2 font-bold tracking-widest uppercase ${state.testActiveTab === 'custom' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
                  onClick={() => dispatch({ type: 'SET_TEST_TAB', payload: 'custom' })}
                >
                  Custom Input
                </button>
                <button
                  className="px-4 py-2 font-bold tracking-widest uppercase text-red-400 hover:text-red-300 ml-auto"
                  onClick={() => dispatch({ type: 'TOGGLE_TEST_PANEL' })}
                >
                  Close
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 bg-zinc-950">
                {state.testingStatus === 'running' && (
                  <div className="text-yellow-500 animate-pulse font-bold tracking-widest mb-4">RUNNING TESTS...</div>
                )}
                
                {state.testActiveTab === 'samples' && (
                  <div className="flex flex-col gap-6">
                    {state.samples.map((sample, idx) => {
                      const res = state.sampleResults[idx];
                      let outputText = '';
                      let outputClassName = 'bg-zinc-900 text-zinc-300';

                      if (res) {
                        if (res.compileError) {
                          outputText = res.compileError;
                          outputClassName = 'bg-red-500/10 text-red-500';
                        } else if (res.stderr === 'Piston server unreachable') {
                          outputText = 'Piston server unreachable';
                          outputClassName = 'bg-red-500/10 text-red-500';
                        } else if (res.exitCode !== 0) {
                          outputText = `${res.stderr}\nExit code: ${res.exitCode}`;
                          outputClassName = 'bg-red-500/10 text-red-500';
                        } else if (res.stdout === '') {
                          outputText = `(No Output — exit code: ${res.exitCode})`;
                          outputClassName = 'bg-red-500/10 text-red-500';
                        } else {
                          outputText = res.stdout;
                          outputClassName = res.passed ? 'bg-green-500/10 text-green-400' : 'bg-zinc-900 text-zinc-300';
                        }
                      }

                      return (
                        <div key={idx} className="border-2 border-zinc-800 p-4 bg-black">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-zinc-400">Test Case {idx + 1}</span>
                            {res && (
                              <span className={`px-2 py-1 font-bold ${res.passed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                {res.passed ? 'PASS' : 'FAIL'}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-zinc-500 text-xs font-bold mb-1">INPUT</div>
                              <pre className="bg-zinc-900 p-2 text-zinc-300 font-mono text-xs whitespace-pre-wrap select-all">{sample.input}</pre>
                            </div>
                            <div>
                              <div className="text-zinc-500 text-xs font-bold mb-1">EXPECTED</div>
                              <pre className="bg-zinc-900 p-2 text-zinc-300 font-mono text-xs whitespace-pre-wrap select-all">
                                {sample.expectedOutput === 'CUSTOM_VALIDATED' ? 'Custom Validated' : sample.expectedOutput}
                              </pre>
                            </div>
                          </div>
                          
                          {res && (
                            <div className="mt-4">
                              <div className="text-zinc-500 text-xs font-bold mb-1">OUTPUT</div>
                              <pre className={`p-2 font-mono text-xs whitespace-pre-wrap select-all ${outputClassName}`}>
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
                      <div className="text-zinc-500 text-xs font-bold mb-1">STDIN</div>
                      <textarea 
                        className="w-full bg-zinc-900 border-2 border-zinc-800 p-2 text-zinc-300 font-mono text-xs h-24 outline-none focus:border-blue-500"
                        value={state.customInput}
                        onChange={(e) => dispatch({ type: 'SET_CUSTOM_INPUT', payload: e.target.value })}
                        placeholder={"Enter input in CF format:\nLine 1: number of test cases (t)\nThen input for each test case"}
                      />
                    </div>
                    
                    {state.customOutput && (
                      <div className="mt-2">
                        <div className="text-zinc-500 text-xs font-bold mb-1">STDOUT / STDERR</div>
                        <pre className="bg-zinc-900 p-2 text-zinc-300 font-mono text-xs whitespace-pre-wrap">
                          {state.customOutput.stdout || state.customOutput.stderr || '(No Output)'}
                        </pre>
                        {state.customOutput.exitCode !== 0 && (
                          <div className="text-red-500 text-xs mt-1">Exited with code {state.customOutput.exitCode}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-[40%] bg-black overflow-y-auto p-8 relative">
          <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase">{state.problem.title}</h1>
          
          <div className="flex gap-4 mb-8 text-sm uppercase tracking-widest font-bold">
            <span className="bg-blue-600/20 text-blue-400 border-2 border-blue-600 px-3 py-1">
              {state.problem.difficulty}
            </span>
            <span className="border-2 border-zinc-600 text-zinc-400 px-3 py-1">
              Time: {state.problem.timeLimit}s
            </span>
            <span className="border-2 border-zinc-600 text-zinc-400 px-3 py-1">
              Memory: {state.problem.memoryLimit}MB
            </span>
          </div>

          <div className="prose prose-invert max-w-none text-zinc-300 whitespace-pre-wrap leading-relaxed mb-8">
            <CFMathText text={state.problem.description} />
          </div>

          {state.lastVerdict && (
            <div className={`border-4 p-6 text-center mt-8 font-black uppercase tracking-widest text-2xl animate-in slide-in-from-bottom-4 ${state.lastVerdict === 'Accepted' ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-red-500 text-red-500 bg-red-500/10'}`}>
              VERDICT: {state.lastVerdict}
            </div>
          )}
        </div>
      </div>

      <footer className="h-20 border-t-4 border-white flex justify-between items-center px-6 shrink-0 bg-black">
        <select 
          className="bg-black text-white font-bold uppercase tracking-widest border-4 border-white py-2 px-4 outline-none hover:bg-zinc-900 cursor-pointer"
          value={state.language}
          onChange={(e) => dispatch({ type: 'SET_LANGUAGE', payload: e.target.value })}
        >
          <option value="python">Python 3</option>
        </select>

        <div className="flex gap-4">
          <button 
            onClick={handleRunTests}
            disabled={state.testingStatus === 'running'}
            className="bg-transparent text-white font-black uppercase tracking-widest border-4 border-white py-3 px-8 hover:bg-white hover:text-black transition-colors disabled:opacity-50"
          >
            Run Tests
          </button>
          <button 
            onClick={handleSubmit}
            disabled={state.submissionStatus === 'running'}
            className="bg-white text-black font-black uppercase tracking-widest border-4 border-white py-3 px-12 hover:bg-zinc-300 transition-colors disabled:opacity-50 min-w-[200px]"
          >
            {state.submissionStatus === 'running' ? 'Running...' : 'Submit'}
          </button>
        </div>
      </footer>
    </div>
  );
}
