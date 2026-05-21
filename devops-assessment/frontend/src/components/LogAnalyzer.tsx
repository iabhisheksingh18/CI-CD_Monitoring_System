import { useState, useEffect, useCallback } from 'react';
import { aiService } from '../services/aiService';
import {
  Microscope,
  Brain,
  ClipboardList,
  Lightbulb,
  History,
  Wrench,
  Copy,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './LogAnalyzer.css';

interface LogAnalyzerProps {
  projects: any[];
  activeProjectId?: string;
  onProjectChange?: (id: string) => void;
  preloadedLogs?: string;
}

export default function LogAnalyzer({
  projects,
  activeProjectId,
  onProjectChange,
  preloadedLogs,
}: LogAnalyzerProps) {
  const [logInput, setLogInput] = useState('');

  useEffect(() => {
    if (preloadedLogs) {
      setLogInput(preloadedLogs);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, [preloadedLogs]);

  const [aiResult, setAiResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [copiedFix, setCopiedFix] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!activeProjectId) return;
    try {
      const data = await aiService.getProjectHistory(activeProjectId);
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  }, [activeProjectId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logInput.trim()) return;

    setAnalyzing(true);
    setError('');
    setAiResult(null);

    try {
      const result = await aiService.analyzeLog(logInput, activeProjectId);
      setAiResult(result);
      fetchHistory();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Analysis failed. Make sure the AI service is running.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClear = () => {
    setLogInput('');
    setAiResult(null);
    setError('');
  };

  const loadFromHistory = (run: any) => {
    setLogInput(run.logContent);
    setAiResult({
      status: run.status,
      errorType: run.errorType,
      rootCause: run.rootCause,
      suggestion: run.suggestion,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyFix = () => {
    if (aiResult?.suggestion) {
      navigator.clipboard.writeText(aiResult.suggestion);
      setCopiedFix(true);
      setTimeout(() => setCopiedFix(false), 2000);
    }
  };

  // Generate auto-fix command based on error type
  const getAutoFixCommand = () => {
    if (!aiResult) return null;
    const errorType = aiResult.errorType?.toLowerCase() || '';
    if (errorType.includes('dependency') || errorType.includes('module'))
      return 'npm install && npm audit fix --force';
    if (errorType.includes('build') || errorType.includes('compile'))
      return 'npm run build -- --no-strict 2>&1 | head -50';
    if (errorType.includes('test'))
      return 'npm test -- --watchAll=false --passWithNoTests';
    if (errorType.includes('docker'))
      return 'docker system prune -f && docker-compose build --no-cache';
    if (errorType.includes('permission') || errorType.includes('access'))
      return 'chmod -R 755 . && sudo chown -R $USER:$USER .';
    return 'npm ci && npm run build && npm test';
  };

  return (
    <div className="analyzer-panel">
      {/* Header */}
      <div className="analyzer-header">
        <div className="analyzer-icon-box">
          <Microscope size={22} />
        </div>
        <div className="analyzer-header-text">
          <h2>AI Log Diagnostics Engine</h2>
          <p>
            Paste raw CI/CD failure logs below for instant AI-powered root-cause
            analysis, suggestions, and auto-fix commands.
          </p>
        </div>
      </div>

      {/* Project Selector */}
      <div className="project-selector">
        <label>Link analysis to project</label>
        <select
          className="form-input project-select"
          value={activeProjectId || ''}
          onChange={(e) => onProjectChange?.(e.target.value)}
        >
          <option value="">— No Project Selected —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Log Input */}
      <form onSubmit={handleAnalyze}>
        <div className="textarea-wrap">
          <textarea
            id="log-input"
            className="log-textarea"
            placeholder="$ npm run build&#10;&#10;ERROR in src/App.tsx:14:5&#10;TS2304: Cannot find name 'useRouter'..."
            value={logInput}
            onChange={(e) => setLogInput(e.target.value)}
            rows={8}
          />
        </div>
        <div className="textarea-footer">
          <span className="char-count">{logInput.length} characters</span>
        </div>

        {error && <div className="analyzer-error">{error}</div>}

        <div className="analyzer-actions">
          <button
            type="submit"
            className="btn-analyze"
            disabled={analyzing || !logInput.trim()}
          >
            {analyzing ? (
              <>
                <span className="spinner" /> Scanning...
              </>
            ) : (
              <>
                <Brain size={16} /> Analyze Log
              </>
            )}
          </button>
          {logInput && (
            <button type="button" className="btn-clear" onClick={handleClear}>
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Results */}
      {aiResult && (
        <div
          className={`results-card ${
            aiResult.status === 'success' ? 'results-success' : 'results-failure'
          }`}
        >
          <div className="results-header">
            {aiResult.status === 'success' ? (
              <CheckCircle2 size={20} color="var(--success)" />
            ) : (
              <XCircle size={20} color="var(--error)" />
            )}
            <h3>Analysis Complete</h3>
          </div>

          <div className="results-grid">
            <div className="result-block">
              <label>Error Type</label>
              <span
                className={`badge-lg ${
                  aiResult.status === 'success'
                    ? 'badge-lg-success'
                    : 'badge-lg-error'
                }`}
              >
                {aiResult.errorType}
              </span>
            </div>
            <div className="result-block">
              <label>Status</label>
              <span
                className={`badge-lg ${
                  aiResult.status === 'success'
                    ? 'badge-lg-success'
                    : 'badge-lg-error'
                }`}
              >
                {aiResult.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="result-section">
            <h4>
              <ClipboardList size={15} /> Root Cause
            </h4>
            <p>{aiResult.rootCause}</p>
          </div>

          <div className="result-section suggestion-box">
            <h4>
              <Lightbulb size={15} /> Suggested Fix
            </h4>
            <div className="markdown-suggestion">
              <ReactMarkdown>{aiResult.suggestion}</ReactMarkdown>
            </div>
          </div>

          {/* Auto-Fix Section */}
          {aiResult.status !== 'success' && (
            <div className="autofix-section">
              <div className="autofix-header">
                <h4>
                  <Wrench size={14} /> Auto-Fix Command
                </h4>
                <button className="autofix-btn" onClick={handleCopyFix}>
                  <Copy size={12} />
                  {copiedFix ? 'Copied!' : 'Copy Fix'}
                </button>
              </div>
              <div className="autofix-code">
                $ {getAutoFixCommand()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {activeProjectId && history.length > 0 && (
        <div className="history-section">
          <div className="history-header">
            <History size={18} color="var(--text-muted)" />
            <h3>Analysis History</h3>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Error Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((run) => (
                  <tr key={run.id}>
                    <td>{new Date(run.timestamp).toLocaleString()}</td>
                    <td>
                      <span className="badge badge-neutral">
                        {run.errorType}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          run.status === 'success'
                            ? 'badge-success'
                            : 'badge-error'
                        }`}
                      >
                        {run.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-secondary"
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
                        onClick={() => loadFromHistory(run)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
