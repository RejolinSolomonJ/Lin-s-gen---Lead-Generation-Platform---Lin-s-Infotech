import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, Sparkles, Plus } from 'lucide-react';

export default function TopHeader({ onOpenDiscover }) {
  const { user } = useAuth();

  return (
    <header className="top-header">
      {/* Global Search Input (Donezo style) */}
      <div style={{ position: 'relative', width: 360 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          className="input-field"
          style={{ paddingLeft: 38, paddingRight: 60, height: 42, fontSize: '0.84375rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}
          placeholder="Search prospects, tasks, tags..."
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={onOpenDiscover}
          style={{ height: 40, padding: '0 18px' }}
        >
          <Sparkles size={15} /> ⚡ Discover Live Leads
        </button>

        <button className="btn btn-secondary btn-icon" title="Notifications" style={{ width: 40, height: 40 }}>
          <Bell size={18} color="#64748b" />
        </button>

        {/* User Profile Chip (Donezo style) */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '4px 14px 4px 6px',
          background: '#ffffff', border: '1px solid #e2e8f0',
          borderRadius: 100, height: 42, boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, #047857, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '0.8125rem',
          }}>
            {user?.name?.[0] || 'A'}
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>{user?.name || 'Admin'}</div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>Lin's Infotech</div>
          </div>
        </div>
      </div>
    </header>
  );
}
