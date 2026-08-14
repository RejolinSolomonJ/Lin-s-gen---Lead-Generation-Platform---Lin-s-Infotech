import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { leadsAPI, scanAPI, enrichAPI } from '../lib/api';
import { TAB_CATEGORIES } from '../lib/constants';
import FilterBar from '../components/filters/FilterBar';
import LeadTable from '../components/leads/LeadTable';
import KanbanBoard from '../components/leads/KanbanBoard';
import LeadDetailDrawer from '../components/leads/LeadDetailDrawer';
import AddLeadModal from '../components/leads/AddLeadModal';
import DiscoverLeadsModal from '../components/leads/DiscoverLeadsModal';
import OutreachModal from '../components/leads/OutreachModal';
import { Globe, RefreshCw, Zap, Sparkles } from 'lucide-react';

export default function CategoryTabPage() {
  const { tabCategory } = useParams();
  const currentTab = TAB_CATEGORIES.find((t) => t.id === tabCategory) || TAB_CATEGORIES[0];

  const [leads, setLeads] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [region, setRegion] = useState('local');
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'

  // Modals & Drawers
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDiscoverModal, setShowDiscoverModal] = useState(false);
  const [activeOutreachLead, setActiveOutreachLead] = useState(null);
  const [allLocations, setAllLocations] = useState([]);

  useEffect(() => {
    loadCategoryLocations();
  }, [tabCategory, region]);

  useEffect(() => {
    loadLeads();
  }, [tabCategory, region, search, industry, status, location]);

  const loadCategoryLocations = async () => {
    try {
      const { data } = await leadsAPI.getAll({
        tab_category: tabCategory,
        region,
        per_page: 500,
      });
      const locSet = new Set();
      (data.leads || []).forEach((l) => {
        const loc = [l.city, l.country].filter(Boolean).join(', ');
        if (loc) {
          locSet.add(loc);
        }
      });
      setAllLocations(Array.from(locSet).sort());
    } catch (err) {
      console.error('Failed to load category locations:', err);
    }
  };

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
    setLocation('');
  };

  const loadLeads = async () => {
    setLoading(true);
    try {
      const { data } = await leadsAPI.getAll({
        tab_category: tabCategory,
        region,
        search,
        industry,
        outreach_status: status,
        location,
        per_page: 100,
      });
      setLeads(data.leads);
      setTotalCount(data.pagination.total);
    } catch (err) {
      console.error('Failed to load category leads:', err);
    } finally {
      setLoading(false);
    }
  };

  // Derive distinct location choices from currently loaded leads
  const locationOptions = useMemo(() => {
    const locSet = new Set();
    (leads || []).forEach((l) => {
      if (l.city && l.country) {
        locSet.add(`${l.city}, ${l.country}`);
      } else if (l.city) {
        locSet.add(l.city);
      } else if (l.country) {
        locSet.add(l.country);
      }
    });
    return Array.from(locSet).sort();
  }, [leads]);

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await leadsAPI.updateStatus(leadId, newStatus);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, outreach_status: newStatus } : l))
      );
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleQuickScan = async (leadId) => {
    try {
      await scanAPI.scanLead(leadId);
      loadLeads();
    } catch (err) {
      console.error('Quick scan failed:', err);
    }
  };

  const handleQuickEnrich = async (leadId) => {
    try {
      await enrichAPI.enrichLead(leadId);
      loadLeads();
    } catch (err) {
      console.error('Quick enrich failed:', err);
    }
  };

  const handleExport = async () => {
    try {
      const response = await leadsAPI.export({
        tab_category: tabCategory,
        region,
        outreach_status: status,
        location,
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_${tabCategory}_${region}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleLeadCreated = async (formData) => {
    await leadsAPI.create(formData);
    loadLeads();
  };

  const handleDeleteLead = async (leadId) => {
    try {
      await leadsAPI.delete(leadId);
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      setTotalCount((prev) => prev - 1);
    } catch (err) {
      console.error('Delete lead failed:', err);
    }
  };

  const [discoveryAlert, setDiscoveryAlert] = useState(null);

  const handleLeadsDiscovered = async (newLeads, query) => {
    if (query?.city) {
      setLocation(`${query.city}, ${query.country || 'India'}`);
    } else {
      setLocation('');
    }

    const activeCount = (newLeads || []).filter((l) => l.tab_category === tabCategory).length;
    const routedCount = (newLeads || []).length - activeCount;

    if (routedCount > 0) {
      setDiscoveryAlert({
        type: 'info',
        message: `Discovered ${(newLeads || []).length} leads! ${routedCount} leads with websites were automatically routed to other categories (like 'Weak SEO').`
      });
    } else if ((newLeads || []).length > 0) {
      setDiscoveryAlert({
        type: 'success',
        message: `Successfully discovered and loaded ${(newLeads || []).length} new leads under ${currentTab.label}!`
      });
    } else {
      setDiscoveryAlert({
        type: 'warning',
        message: 'No new unique leads discovered. Try searching a different industry or city!'
      });
    }

    setTimeout(() => setDiscoveryAlert(null), 10000);

    await loadCategoryLocations();
    await loadLeads();
  };

  return (
    <div className="fade-in">
      {/* Header Banner */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: '#d1fae5',
                border: '1px solid #a7f3d0',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                color: '#047857',
                fontWeight: 800,
                fontSize: '0.875rem',
              }}
            >
              ★
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
              {currentTab.label} Leads
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9375rem', fontWeight: 500 }}>
            {currentTab.description}
          </p>
        </div>

        {currentTab.pitchAngle && (
          <div
            style={{
              padding: '10px 16px',
              borderRadius: 14,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#047857',
              fontSize: '0.8125rem',
              fontWeight: 600,
              maxWidth: 420,
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            💡 <strong>Pitch Strategy:</strong> "{currentTab.pitchAngle}"
          </div>
        )}
      </div>

      {/* Discovery Alert Toast */}
      {discoveryAlert && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 14,
            marginBottom: 20,
            background: discoveryAlert.type === 'success' ? '#ecfdf5' : discoveryAlert.type === 'info' ? '#f0f9ff' : '#fffbeb',
            border: `1px solid ${discoveryAlert.type === 'success' ? '#a7f3d0' : discoveryAlert.type === 'info' ? '#bae6fd' : '#fde68a'}`,
            color: discoveryAlert.type === 'success' ? '#047857' : discoveryAlert.type === 'info' ? '#0369a1' : '#b45309',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span>{discoveryAlert.type === 'success' ? '🚀' : discoveryAlert.type === 'info' ? 'ℹ️' : '⚠️'}</span>
          <div style={{ flex: 1 }}>{discoveryAlert.message}</div>
          <button
            onClick={() => setDiscoveryAlert(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '1.125rem', color: 'inherit', padding: '0 4px' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <FilterBar
        region={region}
        onRegionChange={handleRegionChange}
        search={search}
        onSearchChange={setSearch}
        industry={industry}
        onIndustryChange={setIndustry}
        status={status}
        onStatusChange={setStatus}
        location={location}
        onLocationChange={setLocation}
        locationOptions={allLocations}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExport}
        onAddLead={() => setShowAddModal(true)}
        onDiscoverLeads={() => setShowDiscoverModal(true)}
        totalCount={totalCount}
      />

      {/* Content View: Table or Kanban */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton" style={{ height: 60, borderRadius: 16 }} />
          ))}
        </div>
      ) : viewMode === 'table' ? (
        <LeadTable
          leads={leads}
          tabCategory={tabCategory}
          onSelectLead={(lead) => setSelectedLeadId(lead.id)}
          onStatusChange={handleStatusChange}
          onQuickScan={handleQuickScan}
          onQuickEnrich={handleQuickEnrich}
          onOpenOutreach={(lead) => setActiveOutreachLead(lead)}
        />
      ) : (
        <KanbanBoard
          leads={leads}
          onSelectLead={(lead) => setSelectedLeadId(lead.id)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Slide-out Lead Detail Drawer */}
      {selectedLeadId && (
        <LeadDetailDrawer
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onLeadUpdated={loadLeads}
          onDeleteLead={handleDeleteLead}
          onOpenOutreach={(lead) => setActiveOutreachLead(lead)}
        />
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <AddLeadModal
          initialTabCategory={tabCategory}
          onClose={() => setShowAddModal(false)}
          onLeadCreated={handleLeadCreated}
        />
      )}

      {/* Discover Live Leads Modal */}
      {showDiscoverModal && (
        <DiscoverLeadsModal
          initialTabCategory={tabCategory}
          initialRegion={region}
          onClose={() => setShowDiscoverModal(false)}
          onLeadsDiscovered={handleLeadsDiscovered}
        />
      )}

      {/* Outreach Campaign Modal */}
      {activeOutreachLead && (
        <OutreachModal
          lead={activeOutreachLead}
          onClose={() => setActiveOutreachLead(null)}
          onOutreachSent={loadLeads}
        />
      )}
    </div>
  );
}
