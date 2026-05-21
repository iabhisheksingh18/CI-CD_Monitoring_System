import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import ProjectsList from './pages/ProjectsList';
import ProjectDetails from './pages/ProjectDetails';
import Chatbot from './components/Chatbot';
import {
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import './index.css';

// Page title updater
function PageTitle() {
  const location = useLocation();

  useEffect(() => {
    const titles: Record<string, string> = {
      '/login': 'Sign In — AI DevOps Platform',
      '/signup': 'Create Account — AI DevOps Platform',
      '/overview': 'Command Center — AI DevOps Platform',
      '/projects': 'Projects — AI DevOps Platform',
      '/settings': 'Settings — AI DevOps Platform',
    };

    const path = location.pathname;
    const title =
      titles[path] ||
      (path.startsWith('/projects/')
        ? 'Project Details — AI DevOps Platform'
        : 'AI DevOps Assistant Platform');

    document.title = title;
  }, [location]);

  return null;
}

import Settings from './pages/Settings';

// 404 page
function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 'var(--space-xl)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 'var(--radius-xl)',
          background: 'var(--error-bg)',
          border: '1px solid var(--error-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-lg)',
        }}
      >
        <AlertTriangle size={36} color="var(--error)" />
      </div>
      <h1
        style={{
          fontSize: '4rem',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          color: 'var(--text-main)',
          marginBottom: 'var(--space-sm)',
        }}
      >
        404
      </h1>
      <p
        style={{
          color: 'var(--text-muted)',
          fontSize: '1rem',
          marginBottom: 'var(--space-xl)',
        }}
      >
        This page doesn't exist in the DevOps multiverse.
      </p>
      <a
        href="/overview"
        className="btn-primary"
        style={{
          width: 'auto',
          padding: '0.7rem 1.5rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          textDecoration: 'none',
        }}
      >
        <ArrowLeft size={16} />
        Back to Command Center
      </a>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <PageTitle />
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={localStorage.getItem('token') ? '/overview' : '/login'}
              replace
            />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/overview"
          element={
            localStorage.getItem('token') ? (
              <Layout>
                <Overview />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/projects"
          element={
            localStorage.getItem('token') ? (
              <Layout>
                <ProjectsList />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/projects/:id"
          element={
            localStorage.getItem('token') ? (
              <Layout>
                <ProjectDetails />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            localStorage.getItem('token') ? (
              <Layout>
                <Settings />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Floating AI Chatbot */}
      <Chatbot />
    </Router>
  );
}
