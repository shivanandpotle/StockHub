import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiBox, FiLayers, FiPackage, FiFileText, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 'var(--sidebar-width)',
    height: '100vh',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    padding: '24px 0',
  };

  const logoContainerStyle = {
    padding: '0 24px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '20px',
  };

  const logoTextStyle = {
    fontSize: '22px',
    fontWeight: '800',
    background: 'var(--gradient-primary)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.5px',
  };

  const navContainerStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '0 16px',
    overflowY: 'auto',
  };

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    color: isActive ? '#ffffff' : 'var(--text-secondary)',
    background: isActive ? 'rgba(67, 97, 238, 0.15)' : 'transparent',
    borderLeft: isActive ? '4px solid var(--accent-blue)' : '4px solid transparent',
    fontWeight: isActive ? '600' : '500',
    fontSize: '14px',
    transition: 'var(--transition-fast)',
  });

  const userSectionStyle = {
    padding: '20px 20px 0',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    margin: '0 16px',
  };

  const avatarStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'var(--gradient-primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
    flexShrink: 0,
  };

  const userInfoStyle = {
    flex: 1,
    overflow: 'hidden',
  };

  const userNameStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const userRoleStyle = {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--accent-cyan)',
    background: 'rgba(76, 201, 240, 0.1)',
    padding: '2px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    marginTop: '2px',
  };

  const logoutBtnStyle = {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '18px',
    padding: '8px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-fast)',
  };

  return (
    <aside style={sidebarStyle}>
      <div style={logoContainerStyle}>
        <FiBox style={{ fontSize: '28px', color: 'var(--accent-blue)' }} />
        <span style={logoTextStyle}>StockHub</span>
      </div>

      <nav style={navContainerStyle}>
        <NavLink to="/" style={linkStyle} end>
          <FiGrid style={{ fontSize: '18px' }} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/products" style={linkStyle}>
          <FiBox style={{ fontSize: '18px' }} />
          <span>Products</span>
        </NavLink>
        <NavLink to="/categories" style={linkStyle}>
          <FiLayers style={{ fontSize: '18px' }} />
          <span>Categories</span>
        </NavLink>
        <NavLink to="/inventory" style={linkStyle}>
          <FiPackage style={{ fontSize: '18px' }} />
          <span>Inventory</span>
        </NavLink>
        <NavLink to="/reports" style={linkStyle}>
          <FiFileText style={{ fontSize: '18px' }} />
          <span>Reports</span>
        </NavLink>
      </nav>

      <div style={userSectionStyle}>
        <div style={avatarStyle}>
          {getInitials(user?.name || user?.email)}
        </div>
        <div style={userInfoStyle}>
          <div style={userNameStyle}>{user?.name || 'User'}</div>
          <div style={userRoleStyle}>{user?.role || 'Admin'}</div>
        </div>
        <button 
          style={logoutBtnStyle} 
          onClick={logout} 
          title="Logout"
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(239, 71, 111, 0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <FiLogOut />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
