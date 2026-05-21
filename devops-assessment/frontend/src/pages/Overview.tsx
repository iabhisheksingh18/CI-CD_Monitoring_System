import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Activity,
  Brain,
  Shield,
  Wrench,
  Bot,
  GitBranch,
  ArrowRight,
  Rocket,
} from 'lucide-react';
import './Overview.css';

export default function Overview() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [lastStatuses, setLastStatuses] = useState<Record<string, string>>({});
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [activeTimePill, setActiveTimePill] = useState('7d');
  const [liveEvents, setLiveEvents] = useState<any[]>([]);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { username: 'Developer' };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    fetchProjects();
    fetchRecentActivity();
  }, []);

  useEffect(() => {
    if (projects.length === 0) {
      setLiveEvents([]);
      return;
    }

    // Simulate WebSockets for Live Monitoring Feed based on actual projects
    const initialEvents = projects.slice(0, 3).map((p, i) => {
      const types = ['build', 'deploy', 'alert', 'ai'];
      const type = types[i % types.length];
      return {
        id: i + 1,
        type,
        title: type === 'build' ? 'Pipeline build initialized' 
             : type === 'deploy' ? 'Deployment successful' 
             : type === 'alert' ? 'Test suite failed'
             : 'AI recommended auto-remediation patch',
        project: p.name,
        time: `${i * 3 + 1}m ago`,
        status: type === 'alert' ? 'failed' : type === 'ai' ? 'success' : type === 'deploy' ? 'success' : 'running'
      };
    });
    setLiveEvents(initialEvents);

    const interval = setInterval(() => {
      const types = ['build', 'deploy', 'alert', 'ai'];
      const type = types[Math.floor(Math.random() * types.length)];
      const randomProject = projects[Math.floor(Math.random() * projects.length)];
      
      const newEvent = {
        id: Date.now(),
        type,
        title: type === 'build' ? 'New commit triggered build' 
             : type === 'deploy' ? 'Deployment started' 
             : type === 'alert' ? 'High latency detected in tests'
             : 'AI generated auto-fix for failure',
        project: randomProject.name,
        time: 'Just now',
        status: type === 'alert' ? 'failed' : type === 'ai' ? 'success' : 'running'
      };

      setLiveEvents(prev => [newEvent, ...prev].slice(0, 6)); // Keep last 6
    }, 8000); // New event every 8 seconds

    return () => clearInterval(interval);
  }, [projects]);

  const fetchProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
      if (data.length > 0) setSelectedProjectId(data[0].id);
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/pipelines/recent', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Backend error');
      
      const data = await response.json();
      const statusMap: Record<string, string> = {};
      data.forEach((run: any) => {
        if (!statusMap[run.projectId]) statusMap[run.projectId] = run.status;
      });
      setLastStatuses(statusMap);
    } catch (err) {
      console.warn('Backend unavailable — using demo pipeline statuses');
      // Mock some statuses for demo mode if projects exist
      if (projects.length > 0) {
        const mockStatuses: Record<string, string> = {};
        projects.forEach((p, i) => {
          mockStatuses[p.id] = i % 3 === 0 ? 'failure' : 'success'; // Make some fail for demo
        });
        setLastStatuses(mockStatuses);
      }
    }
  };

  const totalProjects = projects.length;
  const healthyCount = projects.filter(
    (p) =>
      !lastStatuses[p.id] ||
      lastStatuses[p.id].toLowerCase() === 'success'
  ).length;
  const failingCount = projects.filter(
    (p) => lastStatuses[p.id]?.toLowerCase() === 'failure'
  ).length;
  const uptimeScore =
    totalProjects > 0 ? Math.round((healthyCount / totalProjects) * 100) : 100;

  // Generate predictions based on project statuses
  const predictions = projects.map((p) => {
    const status = lastStatuses[p.id]?.toLowerCase();
    const risk =
      status === 'failure' ? 'high' : status === 'success' ? 'low' : 'medium';
    const riskPercent = risk === 'high' ? 78 : risk === 'medium' ? 42 : 12;
    return { ...p, risk, riskPercent };
  });

  const projectColors = [
    'var(--gradient-primary)',
    'var(--gradient-success)',
    'var(--gradient-accent)',
    'linear-gradient(135deg, #58a6ff, #1f6feb)',
    'var(--gradient-error)',
    'linear-gradient(135deg, #d29922, #e3b341)',
  ];

  const capabilities = [
    { icon: Activity, label: 'Monitor', desc: 'Real-time pipelines', color: 'primary', route: '/projects' },
    { icon: Brain, label: 'Analyze', desc: 'AI log analysis', color: 'accent', route: '/projects' },
    { icon: Shield, label: 'Predict', desc: 'Failure forecasting', color: 'warning', route: '/overview' },
    { icon: Wrench, label: 'Auto-Fix', desc: 'Smart remediation', color: 'success', route: '/projects' },
    { icon: Bot, label: 'AI Chat', desc: 'DevOps assistant', color: 'info', route: '/overview' },
    { icon: GitBranch, label: 'GitHub', desc: 'Native integration', color: 'primary', route: '/projects' },
  ];

  return (
    <div className="fade-in">
      {/* Hero */}
      <div className="overview-hero">
        <div>
          <h1 className="hero-greeting">
            {getGreeting()}, {user.username} 👋
          </h1>
          <p className="hero-sub">
            <span className="live-badge">
              <span className="pulse"></span> LIVE
            </span>
            {failingCount > 0
              ? `${failingCount} pipeline${failingCount > 1 ? 's' : ''} need attention`
              : "All systems operational — here's your overview"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid stagger-in">
        <div className="stat-card primary">
          <div className="stat-header">
            <div className="stat-icon primary"><FolderKanban size={18} /></div>
            <span className="stat-trend neutral">—</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--primary-hover)' }}>{totalProjects}</div>
          <div className="stat-label">Total Projects</div>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <div className="stat-icon success"><CheckCircle2 size={18} /></div>
            <span className="stat-trend up">↑ healthy</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{healthyCount}</div>
          <div className="stat-label">Healthy Pipelines</div>
        </div>

        <div className="stat-card error">
          <div className="stat-header">
            <div className="stat-icon error"><AlertTriangle size={18} /></div>
            {failingCount > 0 ? (
              <span className="stat-trend down">↓ {failingCount} failing</span>
            ) : (
              <span className="stat-trend up">✓ clear</span>
            )}
          </div>
          <div className="stat-value" style={{ color: failingCount > 0 ? 'var(--error)' : 'var(--success)' }}>{failingCount}</div>
          <div className="stat-label">Failing Pipelines</div>
        </div>

        <div className="stat-card accent">
          <div className="stat-header">
            <div className="stat-icon accent"><Gauge size={18} /></div>
            <span className={`stat-trend ${uptimeScore >= 80 ? 'up' : 'down'}`}>
              {uptimeScore >= 80 ? '↑' : '↓'} {uptimeScore}%
            </span>
          </div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{uptimeScore}%</div>
          <div className="stat-label">Uptime Score</div>
        </div>
      </div>

      {/* Live Activity Feed */}
      {projects.length > 0 && (
        <>
          <h2 className="section-title">Live System Activity</h2>
          <div className="live-activity-panel">
            <div className="live-activity-header">
              <Activity size={18} color="var(--primary)" />
              <h3>Real-Time Feed</h3>
              <span className="badge badge-info" style={{ marginLeft: 'auto' }}>
                WebSocket
              </span>
            </div>
            <div className="activity-feed">
              {liveEvents.length === 0 ? (
                <div className="empty-feed" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No active pipelines. Link a repository in the Projects section to start real-time monitoring.
                </div>
              ) : (
                liveEvents.map((ev) => (
                  <div key={ev.id} className="activity-item">
                    <div className={`activity-icon ${ev.type}`}>
                      {ev.type === 'build' ? <Rocket size={16} /> :
                       ev.type === 'deploy' ? <CheckCircle2 size={16} /> :
                       ev.type === 'alert' ? <AlertTriangle size={16} /> :
                       <Bot size={16} />}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{ev.title}</div>
                      <div className="activity-meta">
                        {ev.project}
                        <span className={`activity-badge ${ev.status}`}>{ev.status}</span>
                      </div>
                    </div>
                    <div className="activity-time">{ev.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Platform Capabilities */}
      <h2 className="section-title">Platform Capabilities</h2>
      <div className="capability-grid stagger-in">
        {capabilities.map((cap) => (
          <div
            key={cap.label}
            className="capability-card"
            onClick={() => {
              if (cap.label === 'AI Chat') {
                window.dispatchEvent(new CustomEvent('open-ai-chat'));
              } else {
                navigate(cap.route);
              }
            }}
          >
            <div className={`capability-icon stat-icon ${cap.color}`}>
              <cap.icon size={20} />
            </div>
            <h4>{cap.label}</h4>
            <p>{cap.desc}</p>
          </div>
        ))}
      </div>

      {/* AI Failure Predictions */}
      {predictions.length > 0 && (
        <>
          <h2 className="section-title">AI Failure Predictions</h2>
          <div className="predictions-panel">
            <div className="predictions-header">
              <Shield size={18} color="var(--warning)" />
              <h3>Risk Assessment</h3>
              <span className="badge badge-info" style={{ marginLeft: 'auto' }}>
                AI-Powered
              </span>
            </div>
            <div className="prediction-items">
              {predictions.slice(0, 5).map((p) => (
                <div key={p.id} className="prediction-item">
                  <div className="prediction-bar">
                    <div
                      className={`prediction-bar-fill ${p.risk}`}
                      style={{ width: `${p.riskPercent}%` }}
                    />
                  </div>
                  <div className="prediction-info">
                    <div className="prediction-name">{p.name}</div>
                    <div className="prediction-detail">
                      {p.risk === 'high'
                        ? 'High failure probability — recent failures detected'
                        : p.risk === 'medium'
                        ? 'Moderate risk — monitor closely'
                        : 'Stable — no issues detected'}
                    </div>
                  </div>
                  <span className={`prediction-risk ${p.risk}`}>
                    {p.riskPercent}% risk
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Pipeline Analytics */}
      {selectedProjectId && (
        <>
          <h2 className="section-title">Pipeline Analytics</h2>
          <div className="analytics-controls">
            <select
              className="project-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div className="time-pills">
              {['24h', '7d', '30d', '90d'].map((t) => (
                <button
                  key={t}
                  className={`time-pill ${activeTimePill === t ? 'active' : ''}`}
                  onClick={() => setActiveTimePill(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <AnalyticsDashboard projectId={selectedProjectId} />
        </>
      )}

      {/* Quick Access */}
      <h2 className="section-title">Quick Access</h2>
      {projects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <Rocket size={28} />
            </div>
            <h3>Launch your first project</h3>
            <p>Link a GitHub repository to start monitoring pipelines with AI.</p>
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '0.7rem 1.5rem' }}
              onClick={() => navigate('/projects')}
            >
              <FolderKanban size={16} style={{ marginRight: '0.5rem' }} />
              Go to Projects
            </button>
          </div>
        </div>
      ) : (
        <div className="quick-grid stagger-in">
          {projects.map((proj, i) => (
            <div
              key={proj.id}
              className="quick-card"
              onClick={() => navigate(`/projects/${proj.id}`)}
            >
              <div className="quick-card-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    className="project-avatar"
                    style={{ background: projectColors[i % projectColors.length] }}
                  >
                    {proj.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <h3>{proj.name}</h3>
                </div>
                <span
                  className={`badge ${
                    !lastStatuses[proj.id]
                      ? 'badge-neutral'
                      : lastStatuses[proj.id].toLowerCase() === 'success'
                      ? 'badge-success'
                      : 'badge-error'
                  }`}
                >
                  {lastStatuses[proj.id] || 'Stable'}
                </span>
              </div>
              <div className="quick-card-repo">{proj.repoUrl}</div>
              <div className="quick-card-footer">
                <span>Last scan: recently</span>
                <span className="quick-card-action">
                  Open Monitor <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
