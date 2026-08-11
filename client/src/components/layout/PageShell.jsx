import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import DiscoverLeadsModal from '../leads/DiscoverLeadsModal';

export default function PageShell() {
  const [showDiscoverModal, setShowDiscoverModal] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface-950)' }}>
      <Sidebar />
      <div style={{
        flex: 1,
        marginLeft: 270,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease',
      }}>
        <TopHeader onOpenDiscover={() => setShowDiscoverModal(true)} />
        <main style={{ flex: 1, padding: '28px 32px' }}>
          <Outlet />
        </main>
      </div>

      {showDiscoverModal && (
        <DiscoverLeadsModal
          onClose={() => setShowDiscoverModal(false)}
          onLeadsDiscovered={() => window.location.reload()}
        />
      )}
    </div>
  );
}
