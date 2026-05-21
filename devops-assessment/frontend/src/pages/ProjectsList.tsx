import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { aiService } from '../services/aiService';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Play,
  Trash2,
  X,
  GitBranch,
  ArrowRight,
  Rocket,
  FolderKanban,
} from 'lucide-react';
import './ProjectsList.css';

export default function ProjectsList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [newProject, setNewProject] = useState({ name: '', repoUrl: '', owner: '' });
  const [lastStatuses, setLastStatuses] = useState<Record<string, string>>({});
  const [triggering, setTriggering] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setNewProject((prev) => ({ ...prev, owner: user.username }));
    }
    fetchProjects();
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/pipelines/recent', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
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
      if (projects.length > 0) {
        const mockStatuses: Record<string, string> = {};
        projects.forEach((p, i) => {
          mockStatuses[p.id] = i % 3 === 0 ? 'failure' : 'success';
        });
        setLastStatuses(mockStatuses);
      }
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectService.createProject(newProject);
      setNewProject({ ...newProject, name: '', repoUrl: '' });
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };

  const handleDeleteProject = async (proj: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `Are you sure you want to remove "${proj.name}"? This will untether it from your dashboard.`
      )
    )
      return;

    try {
      await projectService.deleteProject(proj.id);
      setProjects(projects.filter((p) => p.id !== proj.id));
      fetchRecentActivity();
    } catch (err: any) {
      alert('Failed to delete project: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleTriggerCI = async (proj: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const workflowId = prompt('Enter GitHub Workflow filename (e.g. main.yml):', 'main.yml');
    if (!workflowId) return;

    setTriggering(proj.id);
    try {
      await aiService.triggerPipeline(proj.repoUrl, workflowId);
      navigate(`/projects/${proj.id}?trigger=true`);
    } catch (err: any) {
      alert('Failed to trigger: ' + (err.response?.data?.message || err.message));
      setTriggering(null);
    }
  };

  const getStatusClass = (projId: string) => {
    const s = lastStatuses[projId]?.toLowerCase();
    if (s === 'success') return 'success';
    if (s === 'failure') return 'error';
    return 'neutral';
  };

  const filteredProjects = projects.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.repoUrl?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const projectColors = [
    'var(--gradient-primary)',
    'var(--gradient-success)',
    'var(--gradient-accent)',
    'linear-gradient(135deg, #58a6ff, #1f6feb)',
    'var(--gradient-error)',
    'linear-gradient(135deg, #d29922, #e3b341)',
  ];

  return (
    <div className="fade-in">
      <div className="dash-header">
        <div>
          <h1>Registered Targets</h1>
          <p>Manage your linked microservices and repositories</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="projects-action-bar">
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="view-toggle">
          <button
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={viewMode === 'table' ? 'active' : ''}
            onClick={() => setViewMode('table')}
            title="Table view"
          >
            <List size={16} />
          </button>
        </div>

        <button className="add-project-btn" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Add Project
        </button>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        filteredProjects.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon"><Rocket size={28} /></div>
              <h3>No projects found</h3>
              <p>{searchQuery ? 'Try a different search term' : 'Link a repository to get started'}</p>
            </div>
          </div>
        ) : (
          <div className="projects-grid stagger-in">
            {filteredProjects.map((proj, i) => (
              <div
                key={proj.id}
                className={`project-card ${getStatusClass(proj.id)}`}
                onClick={() => navigate(`/projects/${proj.id}`)}
              >
                <div className="project-card-header">
                  <div className="project-card-name">
                    <div
                      className="project-avatar"
                      style={{ background: projectColors[i % projectColors.length], width: 32, height: 32, fontSize: '0.75rem', borderRadius: 'var(--radius-md)' }}
                    >
                      {proj.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <h3>{proj.name}</h3>
                  </div>
                  <span className={`badge badge-${getStatusClass(proj.id)}`}>
                    {lastStatuses[proj.id] || 'Stable'}
                  </span>
                </div>
                <div className="project-card-repo">{proj.repoUrl}</div>
                <div className="project-card-footer">
                  <div className="project-card-actions">
                    <button
                      className="trigger-btn"
                      onClick={(e) => handleTriggerCI(proj, e)}
                      disabled={triggering === proj.id}
                    >
                      <Play size={12} />
                      {triggering === proj.id ? 'Starting...' : 'Test & Monitor'}
                    </button>
                    <button
                      className="btn-delete"
                      title="Remove"
                      onClick={(e) => handleDeleteProject(proj, e)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    Details <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Table View */
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Project Name</th>
                <th>Repository</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    {searchQuery ? 'No matching projects' : 'No projects linked yet'}
                  </td>
                </tr>
              ) : (
                filteredProjects.map((proj) => (
                  <tr
                    key={proj.id}
                    className={`status-${getStatusClass(proj.id)}`}
                    onClick={() => navigate(`/projects/${proj.id}`)}
                  >
                    <td><span className="code-chip">{proj.id.substring(0, 6)}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{proj.name}</td>
                    <td style={{ color: 'var(--primary)', fontSize: '0.82rem' }}>{proj.repoUrl}</td>
                    <td>
                      <span className={`badge badge-${getStatusClass(proj.id)}`}>
                        {lastStatuses[proj.id] || 'Stable'}
                      </span>
                    </td>
                    <td>
                      <div className="action-cell">
                        <button
                          className="trigger-btn"
                          onClick={(e) => handleTriggerCI(proj, e)}
                          disabled={triggering === proj.id}
                        >
                          <Play size={12} />
                          {triggering === proj.id ? 'Starting...' : 'Test'}
                        </button>
                        <button
                          className="btn-delete"
                          title="Remove"
                          onClick={(e) => handleDeleteProject(proj, e)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Project Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Link New Repository</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <p className="modal-note">
              Connect a GitHub repository to enable real-time CI/CD monitoring, AI-powered log analysis, and failure predictions. Ensure your{' '}
              <code>github.token</code> is configured in <code>application.properties</code>.
            </p>

            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="form-label">Service Name</label>
                <div className="input-with-icon">
                  <FolderKanban className="input-icon" />
                  <input
                    className="form-input"
                    placeholder="e.g. Auth-API"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">GitHub Repository URL</label>
                <div className="input-with-icon">
                  <GitBranch className="input-icon" />
                  <input
                    className="form-input"
                    placeholder="https://github.com/org/repo"
                    value={newProject.repoUrl}
                    onChange={(e) => setNewProject({ ...newProject, repoUrl: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button className="btn-primary" type="submit">
                <Plus size={16} style={{ marginRight: '0.4rem' }} />
                Link Repository
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
