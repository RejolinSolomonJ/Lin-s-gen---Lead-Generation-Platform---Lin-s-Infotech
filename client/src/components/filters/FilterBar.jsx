import React, { useState } from 'react';
import { Search, Download, Plus, LayoutList, Columns, MapPin, Filter, X } from 'lucide-react';
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
  location = '',
  onLocationChange,
  locationOptions = [],
  viewMode,
  onViewModeChange,
  onExport,
  onAddLead,
  onDiscoverLeads,
  totalCount,
}) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const hasActiveFilters = Boolean(search || industry || status || location);

  const clearAllFilters = () => {
    onSearchChange('');
    onIndustryChange('');
    onStatusChange('');
    onLocationChange && onLocationChange('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
      {/* Top Controls Row */}
      <div
        className="filter-controls-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {/* Region Toggle */}
        <div className="region-toggle" style={{ flexShrink: 0 }}>
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

        {/* Action Buttons & View Mode */}
        <div
          className="filter-actions-row"
          style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}
        >
          {/* Mobile Filter Toggle Button */}
          <button
            className={`btn btn-sm md:hidden ${hasActiveFilters ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Filter size={15} />
            Filters {hasActiveFilters && '•'}
          </button>

          {/* View Toggle (Table / Kanban) */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: 12,
              padding: 3,
              border: '1px solid #e2e8f0',
            }}
          >
            <button
              className={`btn btn-ghost btn-sm ${viewMode === 'table' ? 'btn-primary' : ''}`}
              onClick={() => onViewModeChange('table')}
              title="Table View"
              style={{ padding: '6px 12px', fontSize: '0.78125rem' }}
            >
              <LayoutList size={15} /> <span className="hidden sm:inline">Table</span>
            </button>
            <button
              className={`btn btn-ghost btn-sm ${viewMode === 'kanban' ? 'btn-primary' : ''}`}
              onClick={() => onViewModeChange('kanban')}
              title="Kanban View"
              style={{ padding: '6px 12px', fontSize: '0.78125rem' }}
            >
              <Columns size={15} /> <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={onExport} title="Export CSV">
            <Download size={15} /> <span className="hidden sm:inline">Export</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={onDiscoverLeads}
            style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
            title="Discover real operating businesses in real-time"
          >
            ⚡ <span className="hidden xs:inline">Discover Leads</span>
          </button>

          <button className="btn btn-secondary btn-sm" onClick={onAddLead}>
            <Plus size={15} /> <span className="hidden sm:inline">Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Inputs Row (Desktop always visible, mobile toggleable) */}
      <div
        style={{
          display: showMobileFilters ? 'flex' : undefined,
          flexDirection: 'column',
          gap: 12,
        }}
        className={`filter-inputs-panel ${showMobileFilters ? 'flex' : 'hidden md:flex'}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: 36, height: 38 }}
              placeholder="Search company, contact, notes..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Location Filter Dropdown */}
          <div style={{ flex: '1 1 180px', minWidth: 160 }}>
            <select
              className="select-field"
              style={{ height: 38, fontSize: '0.8125rem' }}
              value={location}
              onChange={(e) => onLocationChange && onLocationChange(e.target.value)}
            >
              <option value="">All Locations</option>
              {((locationOptions && locationOptions.length > 0)
                ? locationOptions
                : ['Chennai, India', 'Coimbatore, India', 'Bangalore, India', 'Dubai, UAE', 'Madurai, India', 'Trichy, India', 'Salem, India', 'Kochi, India']
              ).map((loc) => (
                <option key={loc} value={loc}>
                  📍 {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Industry Filter */}
          <div style={{ flex: '1 1 160px', minWidth: 140 }}>
            <select
              className="select-field"
              style={{ height: 38, fontSize: '0.8125rem' }}
              value={industry}
              onChange={(e) => onIndustryChange(e.target.value)}
            >
              <option value="">All Industries</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Outreach Status Filter */}
          <div style={{ flex: '1 1 160px', minWidth: 140 }}>
            <select
              className="select-field"
              style={{ height: 38, fontSize: '0.8125rem' }}
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <option value="">All Statuses</option>
              {OUTREACH_STATUSES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button (If active filters exist) */}
          {hasActiveFilters && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={clearAllFilters}
              style={{ color: '#ef4444', padding: '6px 10px', height: 38, fontSize: '0.78125rem' }}
              title="Clear all filters"
            >
              <X size={14} /> Clear
            </button>
          )}

          {/* Count Indicator */}
          <div style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
            Showing <strong style={{ color: '#0f172a' }}>{totalCount}</strong> lead{totalCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
