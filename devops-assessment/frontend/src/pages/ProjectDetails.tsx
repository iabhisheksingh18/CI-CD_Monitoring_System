import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import GitHubConsole from '../components/GitHubConsole';
import LogAnalyzer from '../components/LogAnalyzer';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import {
  ArrowLeft,
  Monitor,
  Brain,
  BarChart3,
  GitBranch,
  ExternalLink,
  Play,
  Copy,
} from 'lucide-react';
import './ProjectDetails.css';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [consoleLogs, setConsoleLogs] = useState<string>('');
  const [triggerCount, setTriggerCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'monitor' | 'diagnostics' | 'analytics'>('monitor');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) loadProject(id);

    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('trigger') === 'true') {
      setTriggerCount((prev) => prev + 1);
    }
  }, [id, location.search]);

  const loadProject = async (projectId: string) => {
    try {
      const data = await projectService.getProjects();
      const proj = data.find((p: any) => p.id === projectId);
      if (proj) setProject(proj);
      else navigate('/projects');
    } catch (err) {
      console.error('Failed to load project details', err);
    }
  };

  const handleCopyRepo = () => {
    if (project?.repoUrl) {
      navigator.clipboard.writeText(project.repoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!project) {
    return (
      <div className="fade-in" style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto var(--space-md)' }} />
        Loading project...
      </div>
    );
  }

  const tabs = [
    { key: 'monitor' as const, label: 'Live Monitor', icon: Monitor },
    { key: 'diagnostics' as const, label: 'AI Diagnostics', icon: Brain },
    { key: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="fade-in">
      {/* Back */}
      <button className="back-btn" onClick={() => navigate('/projects')}>
        <ArrowLeft size={14} />
        Back to Projects
      </button>

      {/* Header Card */}
      <div className="project-detail-header">
        <div className="project-detail-info">
          <div
            className="project-detail-avatar"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {project.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="project-detail-meta">
            <h1>{project.name}</h1>
            <div className="repo-link">
              <GitBranch size={13} />
              {project.repoUrl}
            </div>
          </div>
        </div>

        <div className="project-detail-actions">
          <button className="detail-action-btn" onClick={handleCopyRepo}>
            <Copy size={14} />
            {copied ? 'Copied!' : 'Copy URL'}
          </button>
          <a
            className="detail-action-btn"
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={14} />
            GitHub
          </a>
          <button
            className="detail-action-btn primary-action"
            onClick={() => setTriggerCount((c) => c + 1)}
          >
            <Play size={14} />
            Trigger CI
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`detail-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon className="tab-icon" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content" key={activeTab}>
        {activeTab === 'monitor' && (
          <GitHubConsole
            project={project}
            triggerCount={triggerCount}
            onAnalyzeLogs={(logs: string) => {
              setConsoleLogs(logs);
              setActiveTab('diagnostics');
            }}
          />
        )}

        {activeTab === 'diagnostics' && (
          <div className="card">
            <LogAnalyzer
              projects={[project]}
              activeProjectId={project.id}
              onProjectChange={() => {}}
              preloadedLogs={consoleLogs}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard projectId={project.id} />
        )}
      </div>
    </div>
  );
}
