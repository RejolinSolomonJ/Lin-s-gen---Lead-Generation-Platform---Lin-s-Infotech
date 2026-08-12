import React, { useState } from 'react';
import { OUTREACH_STATUSES } from '../../lib/constants';
import { ExternalLink, Phone, Mail, MapPin, GripVertical, AlertTriangle } from 'lucide-react';

export default function KanbanBoard({ leads, onSelectLead, onStatusChange }) {
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [activeMobileTab, setActiveMobileTab] = useState('all');

  const getLeadsByStatus = (statusId) => {
    return (leads || []).filter((l) => l.outreach_status === statusId);
  };

  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedLeadId(leadId);
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, statusId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== statusId) {
      setDragOverColumn(statusId);
    }
  };

  const handleDragLeave = (e, statusId) => {
    if (dragOverColumn === statusId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e, statusId) => {
    e.preventDefault();
    setDragOverColumn(null);
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      onStatusChange(leadId, statusId);
    }
    setDraggedLeadId(null);
  };

  const visibleStatuses = activeMobileTab === 'all'
    ? OUTREACH_STATUSES
    : OUTREACH_STATUSES.filter(s => s.id === activeMobileTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Mobile Kanban Column Tabs (Visible on small screens) */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }} className="md:hidden">
        <button
          className={`btn btn-sm ${activeMobileTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveMobileTab('all')}
          style={{ padding: '6px 14px', borderRadius: 100, fontSize: '0.78125rem' }}
        >
          All Columns ({leads ? leads.length : 0})
        </button>
        {OUTREACH_STATUSES.map((st) => {
          const count = getLeadsByStatus(st.id).length;
          return (
            <button
              key={st.id}
              className={`btn btn-sm ${activeMobileTab === st.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveMobileTab(st.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 100,
                fontSize: '0.78125rem',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: st.color }} />
              {st.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: visibleStatuses.length === 1 ? '1fr' : `repeat(${visibleStatuses.length}, minmax(260px, 1fr))`,
          gap: 16,
          overflowX: 'auto',
          paddingBottom: 16,
          scrollSnapType: 'x mandatory',
        }}
      >
        {visibleStatuses.map((status) => {
          const columnLeads = getLeadsByStatus(status.id);
          const isDragOver = dragOverColumn === status.id;

          return (
            <div
              key={status.id}
              className={`kanban-column ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, status.id)}
              onDragLeave={(e) => handleDragLeave(e, status.id)}
              onDrop={(e) => handleDrop(e, status.id)}
              style={{
                scrollSnapAlign: 'start',
                transition: 'all 0.2s ease',
                minWidth: visibleStatuses.length === 1 ? '100%' : 260,
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 14,
                  paddingBottom: 10,
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: status.color }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>{status.label}</span>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#047857',
                    background: '#d1fae5',
                    padding: '2px 9px',
                    borderRadius: 100,
                    border: '1px solid #a7f3d0',
                  }}
                >
                  {columnLeads.length}
                </span>
              </div>

              {/* Column Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 220 }}>
                {columnLeads.map((lead) => {
                  const isBeingDragged = draggedLeadId === lead.id;
                  const painPointsList = Array.isArray(lead.pain_points)
                    ? lead.pain_points
                    : typeof lead.pain_points === 'string'
                    ? [lead.pain_points]
                    : [];

                  const locationText = [lead.city, lead.state, lead.country].filter(Boolean).join(', ');

                  return (
                    <div
                      key={lead.id}
                      className={`kanban-card ${isBeingDragged ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onSelectLead(lead)}
                      style={{ position: 'relative' }}
                    >
                      {/* Top row: Company & Score */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <GripVertical size={14} style={{ color: '#94a3b8', marginTop: 3, cursor: 'grab', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.875rem', lineHeight: 1.25 }}>
                              {lead.company_name}
                            </div>
                            {lead.industry && (
                              <div style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600, marginTop: 2 }}>
                                {lead.industry}
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          className={`score-badge ${
                            lead.lead_score >= 70 ? 'score-high' : lead.lead_score >= 40 ? 'score-medium' : 'score-low'
                          }`}
                          style={{ width: 32, height: 32, fontSize: '0.75rem', flexShrink: 0 }}
                          title={`Lead Score: ${lead.lead_score}`}
                        >
                          {lead.lead_score}
                        </div>
                      </div>

                      {/* Location Badge */}
                      {locationText && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                          <MapPin size={12} color="#047857" style={{ flexShrink: 0 }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {locationText}
                          </span>
                        </div>
                      )}

                      {/* Pain Point Highlight */}
                      {painPointsList.length > 0 && (
                        <div
                          style={{
                            fontSize: '0.6875rem',
                            color: '#b45309',
                            background: '#fef3c7',
                            border: '1px solid #fde68a',
                            padding: '4px 8px',
                            borderRadius: 8,
                            marginBottom: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <AlertTriangle size={12} style={{ flexShrink: 0 }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {painPointsList[0]}
                          </span>
                        </div>
                      )}

                      {/* Footer Actions & Contact info */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'space-between',
                          marginTop: 10,
                          paddingTop: 8,
                          borderTop: '1px solid #f1f5f9',
                          gap: 6,
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {lead.contact_email ? (
                            <span title={lead.contact_email} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <Mail size={12} color="#047857" /> {lead.contact_name ? lead.contact_name.split(' ')[0] : 'Email'}
                            </span>
                          ) : lead.contact_phone ? (
                            <span title={lead.contact_phone} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <Phone size={12} color="#047857" /> Phone
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.6875rem' }}>No contact</span>
                          )}

                          {lead.website_url && (
                            <a
                              href={lead.website_url.startsWith('http') ? lead.website_url : `https://${lead.website_url}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{ color: '#047857', display: 'inline-flex', alignItems: 'center' }}
                              title="Visit Website"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>

                        <select
                          className="select-field"
                          style={{
                            padding: '2px 20px 2px 6px',
                            fontSize: '0.6875rem',
                            height: 26,
                            width: 'auto',
                            maxWidth: 120,
                            borderRadius: 8,
                          }}
                          value={lead.outreach_status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onStatusChange(lead.id, e.target.value)}
                        >
                          {OUTREACH_STATUSES.map((st) => (
                            <option key={st.id} value={st.id}>
                              Move to {st.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}

                {columnLeads.length === 0 && (
                  <div
                    style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: 14,
                      padding: 24,
                      textAlign: 'center',
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: '#ffffff',
                    }}
                  >
                    Drag or drop leads here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
