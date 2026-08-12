import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import DiscoverLeadsModal from '../leads/DiscoverLeadsModal';

export default function PageShell() {
  const [showDiscoverModal, setShowDiscoverModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f9', position: 'relative' }}>
      {/* Mobile Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className="main-content-wrapper"
        style={{
          flex: 1,
          marginLeft: collapsed ? 76 : 270,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          transition: 'margin-left 0.3s ease',
          width: '100%',
        }}
      >
        <TopHeader
          onOpenDiscover={() => setShowDiscoverModal(true)}
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
        />

        <main className="main-container" style={{ flex: 1, padding: '24px 28px' }}>
          <Outlet />
        </main>
      </div>

      {/* Discover Leads Modal */}
      {showDiscoverModal && (
        <DiscoverLeadsModal
          onClose={() => setShowDiscoverModal(false)}
          onLeadsDiscovered={(leads, query) => {
            const targetCategory = query?.tab_category || 'no_website';
            window.location.href = `/leads/${targetCategory}`;
          }}
        />
      )}
    </div>
  );
}
