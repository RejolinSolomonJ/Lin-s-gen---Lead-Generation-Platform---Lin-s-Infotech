import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { leadsAPI, scanAPI, enrichAPI } from '../lib/api';
import { TAB_CATEGORIES } from '../lib/constants';
import FilterBar from '../components/filters/FilterBar';
import LeadTable from '../components/leads/LeadTable';
import KanbanBoard from '../components/leads/KanbanBoard';
import LeadDetailDrawer from '../components/leads/LeadDetailDrawer';
import AddLeadModal from '../components/leads/AddLeadModal';
import DiscoverLeadsModal from '../components/leads/DiscoverLeadsModal';
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
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'

  // Modals & Drawers
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDiscoverModal, setShowDiscoverModal] = useState(false);

  useEffect(() => {
    loadLeads();
  }, [tabCategory, region, search, industry, status]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const { data } = await leadsAPI.getAll({
        tab_category: tabCategory,
        region,
        search,
        industry,
        outreach_status: status,
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
                justifyContent: 'center',
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

      {/* Filter Bar */}
      <FilterBar
        region={region}
        onRegionChange={setRegion}
        search={search}
        onSearchChange={setSearch}
        industry={industry}
        onIndustryChange={setIndustry}
        status={status}
        onStatusChange={setStatus}
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
          onLeadsDiscovered={() => loadLeads()}
        />
      )}
    </div>
  );
}
