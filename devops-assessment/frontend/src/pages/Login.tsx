import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import {
  Zap,
  User,
  Lock,
  Eye,
  EyeOff,
  Activity,
  Brain,
  Shield,
  GitBranch,
  Bot,
  Wrench,
} from 'lucide-react';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.login(formData);
      navigate('/overview');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Activity, label: 'Real-Time Monitor' },
    { icon: Brain, label: 'AI Analysis' },
    { icon: Shield, label: 'Predict Failures' },
    { icon: Wrench, label: 'Auto-Fix' },
    { icon: GitBranch, label: 'GitHub Native' },
    { icon: Bot, label: 'AI Chat' },
  ];

  return (
    <div className="auth-container">
      {/* Left: Branding */}
      <div className="auth-branding">
        <div className="branding-content">
          <div className="branding-logo">
            <Zap size={28} color="white" />
          </div>
          <h1 className="branding-title">
            AI DevOps Assistant Platform
          </h1>
          <p className="branding-subtitle">
            Intelligent CI/CD failure analysis with real-time monitoring,
            predictive insights, and AI-powered auto-remediation.
          </p>
          <div className="feature-pills">
            {features.map((f) => (
              <span key={f.label} className="feature-pill">
                <f.icon className="pill-icon" />
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to your command center</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-with-icon">
                <User className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon password-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" /> Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <Link to="/signup" className="auth-link">
            Don't have an account? <span>Create one</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
