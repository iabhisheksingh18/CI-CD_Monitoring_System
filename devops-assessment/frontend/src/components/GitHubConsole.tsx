import { useState, useEffect, useRef } from 'react';
import { aiService } from '../services/aiService';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader,
  Clock,
  Brain,
  MessageSquare,
  Copy,
  Maximize2,
  Minimize2,
  Monitor,
} from 'lucide-react';
import './GitHubConsole.css';

interface GitHubConsoleProps {
  project: any;
  triggerCount: number;
  onAnalyzeLogs: (logs: string) => void;
}

export default function GitHubConsole({ project, triggerCount, onAnalyzeLogs }: GitHubConsoleProps) {
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [logs, setLogs] = useState<string>('');
  const [loadingRuns, setLoadingRuns] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<any>(null);

  useEffect(() => {
    if (project?.repoUrl) loadRuns(true);
  }, [project, triggerCount]);

  useEffect(() => {
    if (selectedRun && ['in_progress', 'queued', null].includes(selectedRun.conclusion)) {
      pollingRef.current = setInterval(() => refreshLogs(), 5000);
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [selectedRun]);

  // ESC to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  const loadRuns = async (autoSelect = false) => {
    setLoadingRuns(true);
    setError('');
    try {
      const data = await aiService.fetchWorkflowRuns(project.repoUrl);
      setRuns(data);
      if (autoSelect && data.length > 0) handleFetchLogs(data[0]);
    } catch (err) {
      setError('Failed to fetch GitHub runs');
      console.error(err);
    } finally {
      setLoadingRuns(false);
    }
  };

  const refreshLogs = async () => {
    if (!selectedRun) return;
    try {
      const updatedRuns = await aiService.fetchWorkflowRuns(project.repoUrl);
      const updatedRunInfo = updatedRuns.find((r: any) => r.id === selectedRun.id);
      if (updatedRunInfo) setSelectedRun(updatedRunInfo);

      const jobs = await aiService.fetchRunJobs(project.repoUrl, selectedRun.id);
      const targetJob = jobs.find((j: any) => j.conclusion === 'failure') || jobs[0];
      if (targetJob) {
        const rawLogs = await aiService.fetchJobLogs(project.repoUrl, targetJob.id);
        setLogs(rawLogs);
      }
    } catch (err) {
      console.error('Polling error:', err);
    }
  };

  const handleFetchLogs = async (run: any) => {
    setSelectedRun(run);
    setLoadingLogs(true);
    setLogs('');
    setError('');

    try {
      const jobs = await aiService.fetchRunJobs(project.repoUrl, run.id);
      const targetJob = jobs.find((j: any) => j.conclusion === 'failure') || jobs[0];
      if (!targetJob) { setLogs('No jobs found for this run.'); return; }
      const rawLogs = await aiService.fetchJobLogs(project.repoUrl, targetJob.id);
      setLogs(rawLogs);
    } catch (err) {
      setError('Failed to fetch logs from GitHub API');
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'success') return <CheckCircle2 size={16} color="var(--success)" />;
    if (s === 'failure') return <XCircle size={16} color="var(--error)" />;
    if (s === 'in_progress') return <Loader size={16} color="var(--warning)" className="spin-icon" />;
    return <Clock size={16} color="var(--text-dim)" />;
  };

  const isLive = selectedRun && ['in_progress', 'queued', null].includes(selectedRun.conclusion);

  // Group runs by date
  const groupRuns = (runs: any[]) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const groups: { label: string; runs: any[] }[] = [];
    const todayRuns: any[] = [];
    const yesterdayRuns: any[] = [];
    const olderRuns: any[] = [];

    runs.forEach((run) => {
      const d = new Date(run.created_at).toDateString();
      if (d === today) todayRuns.push(run);
      else if (d === yesterday) yesterdayRuns.push(run);
      else olderRuns.push(run);
    });

    if (todayRuns.length) groups.push({ label: 'Today', runs: todayRuns });
    if (yesterdayRuns.length) groups.push({ label: 'Yesterday', runs: yesterdayRuns });
    if (olderRuns.length) groups.push({ label: 'Earlier', runs: olderRuns });
    return groups;
  };

  return (
    <div className={`console-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Sidebar */}
      <div className="console-sidebar">
        <div className="sidebar-header">
          <h3>Workflow Runs</h3>
          <button className="toolbar-btn" onClick={() => loadRuns(false)} disabled={loadingRuns} title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="runs-list">
          {loadingRuns ? (
            <div className="loading-state">
              <Loader size={16} className="spin-icon" style={{ marginRight: '0.5rem' }} />
              Fetching runs...
            </div>
          ) : runs.length === 0 ? (
            <div className="empty-state-inline">No workflow runs found.</div>
          ) : (
            groupRuns(runs).map((group) => (
              <div key={group.label}>
                <div className="run-group-label">{group.label}</div>
                {group.runs.map((run) => (
                  <div
                    key={run.id}
                    className={`run-item ${selectedRun?.id === run.id ? 'active' : ''}`}
                    onClick={() => handleFetchLogs(run)}
                  >
                    <span className="run-status-icon">
                      {getStatusIcon(run.conclusion || run.status)}
                    </span>
                    <div className="run-info">
                      <div className="run-name">{run.name}</div>
                      <div className="run-meta">
                        #{run.run_number} · {new Date(run.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Terminal */}
      <div className="console-main">
        <div className="console-header">
          <div className="console-title-area">
            <span className="console-title">
              {selectedRun
                ? `${selectedRun.name} #${selectedRun.run_number}`
                : 'Select a run to view logs'}
            </span>
            {isLive && (
              <span className="live-badge">
                <span className="live-dot" style={{ width: 6, height: 6 }} />
                Live
              </span>
            )}
          </div>

          {logs && (
            <div className="console-toolbar">
              <button className="console-action-btn analyze" onClick={() => onAnalyzeLogs(logs)}>
                <Brain size={13} />
                AI Diagnostics
              </button>
              <button
                className="console-action-btn chat"
                onClick={() => window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { logContext: logs } }))}
              >
                <MessageSquare size={13} />
                Discuss
              </button>
              <button className="console-action-btn copy" onClick={handleCopyLogs}>
                <Copy size={13} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                className="console-action-btn fullscreen-btn"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
            </div>
          )}
        </div>

        <div className="console-terminal">
          {loadingLogs ? (
            <div className="terminal-loading">
              <span className="cursor-blink">█</span> Pulling raw logs from GitHub API...
            </div>
          ) : logs ? (
            <pre className="terminal-content">
              {logs}
              <div ref={logEndRef} />
            </pre>
          ) : (
            <div className="terminal-placeholder">
              <Monitor size={32} />
              <span>Ready for real-time monitoring</span>
              <span style={{ fontSize: '0.75rem' }}>Select a build run on the left</span>
            </div>
          )}
          {error && <div className="terminal-error">Error: {error}</div>}
        </div>
      </div>

      <style>{`.spin-icon { animation: spin 1s linear infinite; }`}</style>
    </div>
  );
}
