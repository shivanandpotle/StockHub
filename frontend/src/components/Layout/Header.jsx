import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'Dashboard Overview';
      case '/products':
        return 'Product Management';
      case '/categories':
        return 'Category Management';
      case '/inventory':
        return 'Inventory Control';
      case '/reports':
        return 'Analytics & Reports';
      default:
        return 'StockHub';
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const headerStyle = {
    background: 'rgba(26, 26, 46, 0.6)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid var(--border-color)',
    padding: '18px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 90,
  };

  const titleStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  };

  const rightSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  };

  const dateStyle = {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    background: 'rgba(255, 255, 255, 0.04)',
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
  };

  const greetingStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  };

  return (
    <header style={headerStyle}>
      <div>
        <h2 style={titleStyle}>{getPageTitle(location.pathname)}</h2>
      </div>
      <div style={rightSectionStyle}>
        <div style={dateStyle}>{currentDate}</div>
        <div style={greetingStyle}>
          Welcome back, <span style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>{user?.name || 'User'}</span>!
        </div>
      </div>
    </header>
  );
};

export default Header;
