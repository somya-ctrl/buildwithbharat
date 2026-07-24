import React, { useRef, useState, useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { mlAPI } from '../services/api';
import socketService from '../services/socket.js';

const LANGUAGE_LABELS = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TypeScript',
  py: 'Python',
  python: 'Python',
  cpp: 'C++',
  c: 'C',
  java: 'Java',
  go: 'Go',
  rb: 'Ruby',
  rs: 'Rust',
};

// Note: Prettier imports are dynamically loaded in formatDocument to avoid bundling issues.




export default function MonacoEditor({
  value,
  onChange,
  language = 'javascript',
  height = '400px',
  className,
  problemTitle = 'Untitled Problem',
  fileId,
  currentUser,
}) {
  const monaco = useMonaco();
  const editorRef = useRef(null);
  const [output, setOutput] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [collaborators, setCollaborators] = useState([]);

  const remoteUpdateRef = useRef(false);
  const broadcastTimerRef = useRef(null);

  const handleEditorDidMount = (editor, monacoInstance) => {
    editorRef.current = editor;
  };

  // Real-time collaborative sync: join a per-file room and mirror content changes.
  useEffect(() => {
    if (!fileId || !currentUser?.id) return;

    const joinRoom = () => socketService.joinEditor({ fileId, user: currentUser });
    joinRoom();
    // Re-join after any reconnect — otherwise a dropped connection silently
    // falls out of the file room and stops receiving edits from others.
    socketService.onConnect(joinRoom);

    const handleRemoteUpdate = (data) => {
      if (typeof data.content !== 'string') return;
      remoteUpdateRef.current = true;
      onChange && onChange(data.content);
    };
    const handleUserJoined = (data) => {
      setCollaborators((prev) =>
        prev.some((c) => c.userId === data.userId) ? prev : [...prev, data]
      );
    };
    const handleUserLeft = (data) => {
      setCollaborators((prev) => prev.filter((c) => c.userId !== data.userId));
    };

    socketService.onEditorUpdate(handleRemoteUpdate);
    socketService.onEditorUserJoined(handleUserJoined);
    socketService.onEditorUserLeft(handleUserLeft);

    return () => {
      socketService.offConnect(joinRoom);
      socketService.offEditorUpdate(handleRemoteUpdate);
      socketService.offEditorUserJoined(handleUserJoined);
      socketService.offEditorUserLeft(handleUserLeft);
      socketService.leaveEditor({ fileId, userId: currentUser.id });
      setCollaborators([]);
      if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId, currentUser?.id]);

  const handleEditorChange = (val) => {
    onChange && onChange(val);

    if (remoteUpdateRef.current) {
      // This change came from a remote broadcast being applied locally —
      // propagate it upward but don't echo it back out.
      remoteUpdateRef.current = false;
      return;
    }

    if (!fileId) return;
    if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current);
    broadcastTimerRef.current = setTimeout(() => {
      socketService.sendEditorUpdate({ fileId, content: val });
    }, 250);
  };

  const formatDocument = async () => {
    if (!value) return;
    try {
      const prettier = await import('prettier/standalone');
      const parserBabel = await import('prettier/parser-babel');
      const formatted = prettier.format(value, {
        parser: language === 'json' ? 'json' : 'babel',
        plugins: [parserBabel],
        singleQuote: true,
        semi: true,
      });
      onChange && onChange(formatted);
    } catch (e) {
      // fallback to built‑in formatter if Prettier fails
      if (editorRef.current) {
        editorRef.current.getAction('editor.action.formatDocument').run();
      }
    }
  };

  const formatLogArg = (arg) => {
    if (typeof arg === 'string') return arg;
    try {
      return JSON.stringify(arg);
    } catch {
      return String(arg);
    }
  };

  const runJs = (code) => {
    const entries = [];
    const originalLog = console.log;
    console.log = (...args) => {
      entries.push({ type: 'log', text: args.map(formatLogArg).join(' ') });
      originalLog.apply(console, args);
    };
    let result;
    try {
      // eslint-disable-next-line no-eval
      result = eval(code);
    } finally {
      console.log = originalLog;
    }
    if (result !== undefined) {
      entries.push({ type: 'return', text: 'Return value: ' + formatLogArg(result) });
    }
    if (!entries.length) {
      entries.push({ type: 'info', text: '(no output)' });
    }
    return entries;
  };

  const clearOutput = () => setOutput([]);

  const analyzeCode = async () => {
    if (!value || isAnalyzing) return;
    setIsAnalyzing(true);
    setOutput([{ type: 'info', text: 'Analyzing code…' }]);
    try {
      const { data } = await mlAPI.analyze(value, LANGUAGE_LABELS[language] || language, problemTitle);
      const entries = [];
      if (typeof data.overall_score !== 'undefined') {
        entries.push({ type: 'return', text: `Overall Score: ${data.overall_score}` });
      }
      Object.entries(data).forEach(([key, val]) => {
        if (key === 'success' || key === 'overall_score') return;
        const text = typeof val === 'object' && val !== null ? JSON.stringify(val, null, 2) : String(val);
        entries.push({ type: 'log', text: `${key}: ${text}` });
      });
      setOutput(entries.length ? entries : [{ type: 'info', text: '(no analysis data returned)' }]);
    } catch (e) {
      console.error(e);
      setOutput([{ type: 'error', text: 'Analysis failed: ' + (e.response?.data?.message || e.message) }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runCode = async () => {
    setOutput([{ type: 'info', text: 'Running…' }]);
    try {
      if (language === 'javascript' || language === 'js') {
        setOutput(runJs(value));
      } else if (language === 'typescript' || language === 'ts' || language === 'tsx') {
        if (!monaco || !editorRef.current) {
          setOutput([{ type: 'error', text: 'Editor is still loading, please try again in a moment.' }]);
          return;
        }
        const model = editorRef.current.getModel();
        const worker = await monaco.languages.typescript.getTypeScriptWorker();
        const client = await worker(model.uri);
        const emitOutput = await client.getEmitOutput(model.uri.toString());
        const jsFile = emitOutput.outputFiles.find((f) => f.name.endsWith('.js'));
        if (!jsFile) {
          throw new Error('TypeScript compilation produced no output.');
        }
        setOutput(runJs(jsFile.text));
      } else {
        setOutput([{
          type: 'info',
          text: `Run support for ${language} is not implemented yet. Only JavaScript and TypeScript can run in the browser.`,
        }]);
      }
    } catch (e) {
      console.error(e);
      setOutput([{ type: 'error', text: 'Error executing code: ' + e.message }]);
    }
  };

  return (
    <div className={className}>
      {collaborators.length > 0 && (
        <div className="mb-2 flex items-center gap-2 rounded bg-green-900/30 px-3 py-1.5 text-xs text-green-300">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          {collaborators.map((c) => c.name).join(', ')}
          {collaborators.length === 1 ? ' is' : ' are'} also editing this file
        </div>
      )}
      <Editor
        height={height}
        defaultLanguage={language === 'js' ? 'javascript' : language === 'ts' ? 'typescript' : language === 'py' ? 'python' : language === 'cpp' ? 'cpp' : language}
        theme="vs-dark"
        value={value}
        onChange={handleEditorChange}
        options={{
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
        onMount={handleEditorDidMount}
      />
      <>
        <button
          onClick={formatDocument}
          className="mt-2 rounded bg-primary px-3 py-1 text-sm font-medium text-white hover:bg-primary/90"
        >
          Format
        </button>
        <button
          onClick={runCode}
          className="mt-2 ml-2 rounded bg-secondary px-3 py-1 text-sm font-medium text-white hover:bg-secondary/90"
        >
          Run
        </button>
        <button
          onClick={analyzeCode}
          disabled={isAnalyzing}
          className="mt-2 ml-2 rounded bg-purple-600 px-3 py-1 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing…' : 'Analyze'}
        </button>
      </>
      <div className="mt-2 rounded border border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-700 px-3 py-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Output</span>
          <button
            onClick={clearOutput}
            className="text-xs text-gray-400 hover:text-white"
          >
            Clear
          </button>
        </div>
        <div className="max-h-40 overflow-auto whitespace-pre-wrap break-words px-3 py-2 font-mono text-sm">
          {output.length === 0 ? (
            <span className="text-gray-500">Click "Run" to see output here.</span>
          ) : (
            output.map((entry, i) => (
              <div
                key={i}
                className={
                  entry.type === 'error'
                    ? 'text-red-400'
                    : entry.type === 'return'
                    ? 'text-blue-300'
                    : entry.type === 'info'
                    ? 'text-gray-400'
                    : 'text-green-400'
                }
              >
                {entry.text}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
