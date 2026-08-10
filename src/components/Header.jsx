import React from 'react';
import { Wallet, Sun, Moon, WifiOff } from 'lucide-react';

export default function Header({ isOnline, theme, toggleTheme }) {
  return (
    <header className="app-header glass-panel">
      <div className="brand-title">
        <div className="brand-icon">
          <Wallet size={20} />
        </div>
        <span>UtangHandler</span>
      </div>

      <div className="header-actions">
        {!isOnline && (
          <span className="offline-badge" title="Offline Mode - Data saved locally">
            <WifiOff size={16} color="#f59e0b" />
          </span>
        )}
        <button 
          className="icon-btn" 
          onClick={toggleTheme} 
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
