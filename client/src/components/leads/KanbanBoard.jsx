import React from 'react';
import { OUTREACH_STATUSES } from '../../lib/constants';
import { ExternalLink, Phone, Mail, ChevronRight } from 'lucide-react';

export default function KanbanBoard({ leads, onSelectLead, onStatusChange }) {
  const getLeadsByStatus = (statusId) => {
    return (leads || []).filter((l) => l.outreach_status === statusId);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(260px, 1fr))', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
      {OUTREACH_STATUSES.map((status) => {
        const columnLeads = getLeadsByStatus(status.id);
        return (
          <div key={status.id} className="kanban-column">
            {/* Column Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--color-surface-700)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: status.color }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>{status.label}</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-surface-400)', background: 'var(--color-surface-800)', padding: '2px 8px', borderRadius: 100 }}>
                {columnLeads.length}
              </span>
            </div>

            {/* Column Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200 }}>
              {columnLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="kanban-card"
                  onClick={() => onSelectLead(lead)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>
                      {lead.company_name}
                    </div>
                    <div className={`score-badge ${lead.lead_score >= 70 ? 'score-high' : lead.lead_score >= 40 ? 'score-medium' : 'score-low'}`} style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                      {lead.lead_score}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--color-surface-400)', marginBottom: 8 }}>
                    {lead.city ? `${lead.city}, ${lead.country}` : lead.country}
                  </div>

                  {lead.pain_points && lead.pain_points.length > 0 && (
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-accent-400)', background: 'rgba(251, 191, 36, 0.08)', padding: '4px 8px', borderRadius: 6, marginBottom: 8 }}>
                      ⚠️ {lead.pain_points[0]}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-surface-400)' }}>
                      {lead.contact_email ? <Mail size={12} style={{ verticalAlign: 'middle' }} /> : lead.contact_phone ? <Phone size={12} style={{ verticalAlign: 'middle' }} /> : 'No contact'}
                    </div>

                    <select
                      className="select-field"
                      style={{ padding: '2px 18px 2px 6px', fontSize: '0.6875rem', height: 24, width: 'auto' }}
                      value={lead.outreach_status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onStatusChange(lead.id, e.target.value)}
                    >
                      {OUTREACH_STATUSES.map((st) => (
                        <option key={st.id} value={st.id}>Move to {st.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              {columnLeads.length === 0 && (
                <div style={{ border: '1px dashed var(--color-surface-700)', borderRadius: 10, padding: 24, textAlign: 'center', color: 'var(--color-surface-500)', fontSize: '0.75rem' }}>
                  No leads in {status.label}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
