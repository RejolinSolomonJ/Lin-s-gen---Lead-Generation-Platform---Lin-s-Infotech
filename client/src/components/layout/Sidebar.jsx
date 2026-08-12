import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, GlobeLock, SearchX, Bot, Wrench, Database,
  ShoppingCart, CodeXml, FileText, LogOut, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/leads/no_website', label: 'No Website', icon: GlobeLock, color: '#047857' },
  { path: '/leads/weak_seo', label: 'Weak SEO', icon: SearchX, color: '#d97706' },
  { path: '/leads/agentic_ai', label: 'Agentic AI', icon: Bot, color: '#0284c7' },
  { path: '/leads/maintenance', label: 'Maintenance', icon: Wrench, color: '#ea580c' },
  { path: '/leads/erp', label: 'ERP', icon: Database, color: '#059669' },
  { path: '/leads/ecommerce', label: 'E-Commerce', icon: ShoppingCart, color: '#db2777' },
  { path: '/leads/legacy_tech', label: 'Legacy Tech', icon: CodeXml, color: '#7c3aed' },
  { path: '/leads/rfp_watch', label: 'RFP Watch', icon: FileText, color: '#0d9488' },
];

export default function Sidebar({ mobileOpen = false, onCloseMobile, collapsed = false, setCollapsed }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
      {/* Brand Header with Official Lin's Infotech Logo */}
      <div style={{ padding: '20px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/logo.png"
            alt="Lin's Infotech Logo"
            style={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0 }}
          />
          {!collapsed && (
            <div>
              <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Lin's Gen
              </div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', marginTop: 2 }}>
                Lead Generation Platform
              </div>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        {mobileOpen && (
          <button className="btn btn-ghost btn-icon md:hidden" onClick={onCloseMobile} style={{ width: 32, height: 32 }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '18px 0', overflowY: 'auto' }}>
        <div style={{ padding: '0 20px 8px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
          {!collapsed && 'Menu'}
        </div>

        <NavLink
          to="/"
          end
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          title="Dashboard"
          onClick={handleNavClick}
        >
          <LayoutDashboard size={19} />
          {(!collapsed || mobileOpen) && <span>Dashboard</span>}
        </NavLink>

        <div style={{ padding: '20px 20px 8px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
          {(!collapsed || mobileOpen) && 'Lead Categories'}
        </div>

        {NAV_ITEMS.slice(1).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              title={item.label}
              onClick={handleNavClick}
            >
              <Icon size={19} style={isActive ? { color: '#ffffff' } : { color: '#64748b' }} />
              {(!collapsed || mobileOpen) && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div style={{ padding: '14px 14px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setCollapsed && setCollapsed(!collapsed)}
            className="btn btn-ghost btn-icon hidden md:inline-flex"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{ flex: collapsed ? 1 : undefined }}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          {(!collapsed || mobileOpen) && (
            <button onClick={logout} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
