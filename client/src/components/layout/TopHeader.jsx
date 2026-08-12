import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, Sparkles, Menu, LogOut } from 'lucide-react';

export default function TopHeader({ onOpenDiscover, onToggleMobileMenu }) {
  const { user, logout } = useAuth();

  return (
    <header className="top-header">
      {/* Mobile Hamburger Menu Toggle */}
      <button
        className="btn btn-ghost btn-icon md:hidden"
        onClick={onToggleMobileMenu}
        title="Toggle Menu"
        style={{ width: 40, height: 40, flexShrink: 0 }}
      >
        <Menu size={20} color="#0f172a" />
      </button>

      {/* Global Search Input (Donezo style) */}
      <div className="top-header-search" style={{ position: 'relative', width: 320, maxWidth: '100%' }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          className="input-field"
          style={{ paddingLeft: 38, paddingRight: 50, height: 40, fontSize: '0.84375rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}
          placeholder="Search prospects..."
        />
        <div style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          background: '#e2e8f0', padding: '2px 6px', borderRadius: 6,
          fontSize: '0.6875rem', fontWeight: 700, color: '#64748b',
        }}>
          ⌘ F
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={onOpenDiscover}
          style={{ height: 38, padding: '0 14px', fontSize: '0.78125rem' }}
        >
          <Sparkles size={14} /> <span className="hidden sm:inline">⚡ Discover Live Leads</span><span className="sm:hidden">⚡ Discover</span>
        </button>

        <button className="btn btn-secondary btn-icon" title="Notifications" style={{ width: 38, height: 38, flexShrink: 0 }}>
          <Bell size={17} color="#64748b" />
        </button>

        {/* User Profile Chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px 4px 6px',
          background: '#ffffff', border: '1px solid #e2e8f0',
          borderRadius: 100, height: 38, boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #047857, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '0.8125rem',
            flexShrink: 0,
          }}>
            {user?.name?.[0] || 'A'}
          </div>
          <div className="hidden sm:block">
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>{user?.name || 'Admin'}</div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          className="btn btn-ghost btn-icon"
          title="Logout"
          onClick={logout}
          style={{ width: 38, height: 38, flexShrink: 0, marginLeft: 4 }}
        >
          <LogOut size={17} color="#ef4444" />
        </button>
      </div>
    </header>
  );
}
