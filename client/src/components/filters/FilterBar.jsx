import React from 'react';
import { Search, Download, Plus, LayoutList, Columns } from 'lucide-react';
import { REGIONS, INDUSTRIES, OUTREACH_STATUSES } from '../../lib/constants';

export default function FilterBar({
  region,
  onRegionChange,
  search,
  onSearchChange,
  industry,
  onIndustryChange,
  status,
  onStatusChange,
  viewMode,
  onViewModeChange,
  onExport,
  onAddLead,
  onDiscoverLeads,
  totalCount,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
      {/* Top Controls Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        {/* Region Toggle */}
        <div className="region-toggle">
          {REGIONS.map((r) => (
            <button
              key={r.id}
              className={region === r.id ? 'active' : ''}
              onClick={() => onRegionChange(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* View Toggle (Table / Kanban) */}
          <div style={{ display: 'flex', background: 'var(--color-surface-800)', borderRadius: 10, padding: 3, border: '1px solid var(--color-surface-700)' }}>
            <button
              className={`btn btn-ghost btn-sm ${viewMode === 'table' ? 'btn-primary' : ''}`}
              onClick={() => onViewModeChange('table')}
              title="Table View"
            >
              <LayoutList size={16} /> Table
            </button>
            <button
              className={`btn btn-ghost btn-sm ${viewMode === 'kanban' ? 'btn-primary' : ''}`}
              onClick={() => onViewModeChange('kanban')}
              title="Kanban View"
            >
              <Columns size={16} /> Kanban
            </button>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={onExport}>
            <Download size={16} /> Export CSV
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={onDiscoverLeads}
            style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
            title="Discover real operating businesses in real-time"
          >
            ⚡ Discover Live Leads
          </button>

          <button className="btn btn-secondary btn-sm" onClick={onAddLead}>
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {/* Filter Inputs Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-surface-400)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: 36 }}
            placeholder="Search company, contact, notes..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Industry Filter */}
        <div style={{ flex: '0 1 180px' }}>
          <select
            className="select-field"
            value={industry}
            onChange={(e) => onIndustryChange(e.target.value)}
          >
            <option value="">All Industries</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* Outreach Status Filter */}
        <div style={{ flex: '0 1 180px' }}>
          <select
            className="select-field"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="">All Statuses</option>
            {OUTREACH_STATUSES.map((st) => (
              <option key={st.id} value={st.id}>{st.label}</option>
            ))}
          </select>
        </div>

        {/* Count Indicator */}
        <div style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
          Showing <strong style={{ color: '#0f172a' }}>{totalCount}</strong> lead{totalCount !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
