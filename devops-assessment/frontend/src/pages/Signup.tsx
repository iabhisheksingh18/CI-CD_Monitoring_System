import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import {
  Zap,
  User,
  Mail,
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

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = useMemo(() => {
    const p = formData.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.signup({ ...formData, roles: ['user'] });
      // Automatically login after successful signup
      await authService.login({
        username: formData.username,
        password: formData.password,
      });
      navigate('/overview');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register account.');
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
            Join the next generation of intelligent CI/CD monitoring.
            Predict failures, auto-fix issues, and ship with confidence.
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
          <h2 className="auth-title">Create account</h2>
          <p className="auth-subtitle">
            Get started with AI DevOps intelligence
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-with-icon">
                <User className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
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
                  placeholder="Min. 6 characters"
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
              {formData.password && passwordStrength && (
                <>
                  <div className="strength-bar">
                    <div
                      className={`strength-fill ${passwordStrength}`}
                    />
                  </div>
                  <div className={`strength-label ${passwordStrength}`}>
                    {passwordStrength === 'weak' && 'Weak password'}
                    {passwordStrength === 'medium' && 'Decent — add symbols'}
                    {passwordStrength === 'strong' && 'Strong password ✓'}
                  </div>
                </>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" /> Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <Link to="/login" className="auth-link">
            Already have an account? <span>Sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
