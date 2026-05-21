import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Check, AlertCircle } from 'lucide-react';
import './Settings.css';

export default function Settings() {
  const [slackUrl, setSlackUrl] = useState('');
  const [teamsUrl, setTeamsUrl] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load from local storage for demo mode persistence
    const savedConfig = localStorage.getItem('notifications_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setSlackUrl(config.slack || '');
      setTeamsUrl(config.teams || '');
      setEmail(config.email || '');
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    // Simulate network delay
    setTimeout(() => {
      localStorage.setItem(
        'notifications_config',
        JSON.stringify({ slack: slackUrl, teams: teamsUrl, email })
      );
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  return (
    <div className="fade-in settings-page">
      <div className="dash-header">
        <div>
          <h1>Settings</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Platform configuration and preferences
          </p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Integrations & Alerts Panel */}
        <div className="card settings-panel">
          <div className="panel-header">
            <div className="panel-icon">
              <Bell size={20} color="var(--primary-hover)" />
            </div>
            <div>
              <h3>Smart Notifications</h3>
              <p>Configure where pipeline failure alerts should be routed.</p>
            </div>
          </div>

          <div className="panel-body">
            <div className="input-group">
              <label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={14} color="#E01E5A" /> Slack Webhook URL
                </div>
              </label>
              <input
                type="text"
                placeholder="https://hooks.slack.com/services/..."
                value={slackUrl}
                onChange={(e) => setSlackUrl(e.target.value)}
              />
              <span className="input-hint">Receives rich markdown alerts with AI suggestions.</span>
            </div>

            <div className="input-group">
              <label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={14} color="#6264A7" /> MS Teams Webhook URL
                </div>
              </label>
              <input
                type="text"
                placeholder="https://your-domain.webhook.office.com/..."
                value={teamsUrl}
                onChange={(e) => setTeamsUrl(e.target.value)}
              />
              <span className="input-hint">Receives Adaptive Card notifications.</span>
            </div>

            <div className="input-group">
              <label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} color="var(--accent)" /> Alert Email Address
                </div>
              </label>
              <input
                type="email"
                placeholder="devops-team@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="input-hint">Direct email notification for critical pipeline failures.</span>
            </div>

            <div className="panel-actions">
              <button
                className={`btn-primary ${saved ? 'btn-success' : ''}`}
                onClick={handleSave}
                disabled={saving || (!slackUrl && !teamsUrl && !email)}
              >
                {saving ? (
                  <div className="spinner" />
                ) : saved ? (
                  <>
                    <Check size={16} style={{ marginRight: '6px' }} /> Saved
                  </>
                ) : (
                  'Save Configuration'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Placeholder for future settings */}
        <div className="card settings-panel disabled-panel">
          <div className="panel-header">
            <div className="panel-icon" style={{ background: 'var(--bg-surface)' }}>
              <AlertCircle size={20} color="var(--text-muted)" />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-muted)' }}>Advanced Integrations</h3>
              <p>PagerDuty, Datadog, Jira</p>
            </div>
          </div>
          <div className="panel-body" style={{ textAlign: 'center', padding: '2rem' }}>
            <span className="badge badge-neutral">Coming Soon in v2.1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
