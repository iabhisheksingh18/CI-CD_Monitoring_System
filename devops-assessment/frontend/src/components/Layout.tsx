import { type ReactNode, useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import './Layout.css';
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Zap,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { username: 'Guest' };

  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'G';

  // Close mobile drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Build breadcrumb from path
  const getBreadcrumbs = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    return segments.map((seg, i) => ({
      label: seg.charAt(0).toUpperCase() + seg.slice(1),
      path: '/' + segments.slice(0, i + 1).join('/'),
      isLast: i === segments.length - 1,
    }));
  };

  const breadcrumbs = getBreadcrumbs();

  const navItems = [
    { to: '/overview', icon: LayoutDashboard, label: 'Overview' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="layout-container">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`layout-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      >
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Zap size={18} />
          </div>
          <span className="brand-text">DevOps AI</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            <span className="collapse-label">
              {collapsed ? '' : 'Collapse'}
            </span>
          </button>
          <div className="version-tag">v2.0 — AI Platform</div>
        </div>
      </aside>

      {/* Main */}
      <main className="layout-main">
        <header className="layout-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="breadcrumbs">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.path}>
                  {i > 0 && <span className="separator">/</span>}
                  {crumb.isLast ? (
                    <span className="current"> {crumb.label}</span>
                  ) : (
                    <a href={crumb.path} onClick={(e) => { e.preventDefault(); navigate(crumb.path); }}>
                      {' '}{crumb.label}{' '}
                    </a>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="topbar-search">
            <Search className="search-icon" />
            <input type="text" placeholder="Search projects..." />
          </div>

          <div className="user-profile">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className="user-role">Developer</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </header>

        <div className="layout-content">{children}</div>
      </main>
    </div>
  );
}
