import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/verify', label: 'Verify Update', icon: '🔍' },
  { to: '/history', label: 'Verification History', icon: '📋' },
  { to: '/trusted-software', label: 'Trusted Software', icon: '🛡️' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="app-sidebar">
      <style>{`
        .app-sidebar {
          width: 260px;
          min-width: 260px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          height: 100vh;
          box-sizing: border-box;
          z-index: 20;
          position: relative;
        }

        .sidebar-brand {
          padding: 1.6rem 1.4rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
        }

        .brand-text {
          color: #f8fafc;
          font-weight: 800;
          font-size: 1.15rem;
          letter-spacing: -0.01em;
        }

        .brand-subtext {
          color: #64748b;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.25rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 1rem;
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 500;
          border-radius: 12px;
          transition: all 0.2s ease;
          position: relative;
        }

        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #f1f5f9;
          transform: translateX(3px);
        }

        .sidebar-link.active {
          background: rgba(14, 165, 233, 0.14);
          color: #ffffff;
          font-weight: 700;
          border: 1.5px solid #38bdf8;
          border-radius: 14px;
          box-shadow: 
            0 0 18px rgba(56, 189, 248, 0.35),
            inset 0 0 10px rgba(56, 189, 248, 0.2);
        }

        .sidebar-link.active::before {
          content: '';
          position: absolute;
          left: 0px;
          top: 18%;
          height: 64%;
          width: 3.5px;
          background: #38bdf8;
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 12px #38bdf8, 0 0 20px #38bdf8;
        }

        .sidebar-footer {
          padding: 1.2rem 1.4rem;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          background: rgba(15, 23, 42, 0.4);
        }

        .user-pill {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.85rem;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #1e293b;
          border: 1px solid #334155;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          color: #94a3b8;
          font-weight: 700;
        }

        .user-name {
          font-size: 0.84rem;
          font-weight: 600;
          color: #e2e8f0;
        }

        .user-role {
          font-size: 0.7rem;
          color: #38bdf8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .logout-btn {
          width: 100%;
          padding: 0.55rem;
          background: rgba(239, 68, 68, 0.12);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.22);
          border-color: rgba(239, 68, 68, 0.45);
          color: #fca5a5;
        }
      `}</style>

      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)', boxShadow: '0 0 15px rgba(56, 189, 248, 0.45)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(255, 255, 255, 0.15)" stroke="#ffffff" strokeWidth="1.8" />
            <rect x="9" y="11" width="6" height="5" rx="1.5" fill="#38bdf8" />
            <path d="M10 11V9.5a2 2 0 1 1 4 0V11" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        <div>
          <div className="brand-text">TrustUpdate</div>
          <div className="brand-subtext">Security Platform</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span style={{ fontSize: '1.15rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        {user && (
          <div className="user-pill">
            <div className="user-avatar" style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8' }}>
              {user.username ? user.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div className="user-name">{user.username}</div>
              <div className="user-role">● {user.role ? user.role.toUpperCase() : 'ADMIN'}</div>
            </div>
          </div>
        )}
        <button type="button" className="logout-btn" onClick={handleLogout}>
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
