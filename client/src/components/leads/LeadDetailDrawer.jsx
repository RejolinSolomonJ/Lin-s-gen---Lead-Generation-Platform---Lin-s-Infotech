import React, { useState, useEffect } from 'react';
import { leadsAPI, scanAPI, enrichAPI } from '../../lib/api';
import { OUTREACH_STATUSES } from '../../lib/constants';
import {
  X, ExternalLink, Phone, Mail, Share2, Globe, MapPin, Zap, RefreshCw,
  Building, CheckCircle, AlertTriangle, FileText, Send, Trash2
} from 'lucide-react';

export default function LeadDetailDrawer({ leadId, onClose, onLeadUpdated, onDeleteLead, onOpenOutreach }) {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (leadId) {
      loadLead();
    }
  }, [leadId]);

  const loadLead = async () => {
    setLoading(true);
    try {
      const { data } = await leadsAPI.getById(leadId);
      setLead(data);
      setNotes(data.notes || '');
    } catch (err) {
      console.error('Failed to load lead:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const { data } = await leadsAPI.updateStatus(leadId, newStatus);
      setLead(data);
      if (onLeadUpdated) onLeadUpdated(data);
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const { data } = await leadsAPI.update(leadId, { notes });
      setLead(data);
      if (onLeadUpdated) onLeadUpdated(data);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleRunScan = async () => {
    setScanning(true);
    try {
      await scanAPI.scanLead(leadId);
      await loadLead();
      if (onLeadUpdated) onLeadUpdated();
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleRunEnrichment = async () => {
    setEnriching(true);
    try {
      await enrichAPI.enrichLead(leadId);
      await loadLead();
      if (onLeadUpdated) onLeadUpdated();
    } catch (err) {
      console.error('Enrichment failed:', err);
    } finally {
      setEnriching(false);
    }
  };

  if (!leadId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="slide-in-right drawer-panel"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '540px',
          maxWidth: '100vw',
          background: '#ffffff',
          borderLeft: '1px solid #e2e8f0',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.12)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#047857', letterSpacing: '0.05em' }}>
              {lead?.tab_category?.replace('_', ' ')}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
              {lead?.company_name || 'Loading lead...'}
            </h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading || !lead ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
            Loading lead details...
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Lead Score & Pitch Banner */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Lead Score</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                    <div className={`score-badge ${lead.lead_score >= 70 ? 'score-high' : lead.lead_score >= 40 ? 'score-medium' : 'score-low'}`} style={{ width: 44, height: 44, fontSize: '1.125rem' }}>
                      {lead.lead_score}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                        {lead.lead_score >= 70 ? 'High Priority' : lead.lead_score >= 40 ? 'Medium Priority' : 'Low Priority'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {lead.region?.toUpperCase()} · Sourced via {lead.source}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>Status</span>
                  <select
                    className="select-field"
                    style={{ fontSize: '0.8125rem', height: 36, padding: '4px 28px 4px 10px', background: '#ffffff' }}
                    value={lead.outreach_status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    {OUTREACH_STATUSES.map((st) => (
                      <option key={st.id} value={st.id}>{st.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {lead.pitch_angle && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0', fontSize: '0.8125rem', color: '#047857', fontWeight: 600 }}>
                  🎯 <strong>Pitch Angle:</strong> "{lead.pitch_angle}"
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', gap: 10 }}>
              {lead.website_url && (
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={handleRunScan}
                  disabled={scanning}
                >
                  <RefreshCw size={14} className={scanning ? 'spin' : ''} />
                  {scanning ? 'Scanning...' : 'Re-scan Site'}
                </button>
              )}
              <button
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={handleRunEnrichment}
                disabled={enriching}
              >
                <Zap size={14} />
                {enriching ? 'Enriching...' : 'Enrich Contact'}
              </button>
              {onOpenOutreach && (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => onOpenOutreach(lead)}
                  disabled={!lead.contact_email && !lead.contact_phone}
                  title={(!lead.contact_email && !lead.contact_phone) ? "No contact information available" : "Send email and WhatsApp outreach"}
                >
                  <Send size={14} />
                  Send Outreach
                </button>
              )}
            </div>

            {/* Pain Points */}
            {lead.pain_points && lead.pain_points.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                  Detected Pain Points ({lead.pain_points.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {lead.pain_points.map((pt, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.8125rem', color: '#334155', background: '#f8fafc', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontWeight: 500 }}>
                      <AlertTriangle size={15} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Details */}
            <div>
              <h4 style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                Contact Information
              </h4>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Building size={16} color="#64748b" />
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{lead.company_name}</span>
                </div>
                {lead.website_url && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Globe size={16} color="#64748b" />
                    <a href={lead.website_url.startsWith('http') ? lead.website_url : `https://${lead.website_url}`} target="_blank" rel="noreferrer" style={{ color: '#047857', fontWeight: 600 }}>
                      {lead.website_url} <ExternalLink size={12} />
                    </a>
                  </div>
                )}
                {(lead.city || lead.country) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <MapPin size={16} color="#64748b" />
                    <span style={{ color: '#334155' }}>{lead.city ? `${lead.city}, ${lead.state || ''} ${lead.country}` : lead.country}</span>
                  </div>
                )}
                {lead.contact_name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>Name:</span>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{lead.contact_name}</span>
                  </div>
                )}
                {lead.contact_email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Mail size={16} color="#64748b" />
                    <a href={`mailto:${lead.contact_email}`} style={{ color: '#047857', fontWeight: 600 }}>
                      {lead.contact_email}
                    </a>
                  </div>
                )}
                {lead.contact_phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Phone size={16} color="#64748b" />
                    <a href={`tel:${lead.contact_phone}`} style={{ color: '#047857', fontWeight: 600 }}>
                      {lead.contact_phone}
                    </a>
                  </div>
                )}
                {lead.linkedin_url && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Share2 size={16} color="#64748b" />
                    <a href={lead.linkedin_url} target="_blank" rel="noreferrer" style={{ color: '#047857', fontWeight: 600 }}>
                      LinkedIn Profile <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Notes Editor */}
            <div>
              <h4 style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                Internal Notes
              </h4>
              <textarea
                className="input-field"
                rows={4}
                style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' }}
                placeholder="Add outreach notes, discussion points, or next steps..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 8 }}
                onClick={handleSaveNotes}
                disabled={savingNotes}
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>

            {/* Activity History */}
            {lead.activities && lead.activities.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                  Activity History
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {lead.activities.map((act) => (
                    <div key={act.id} style={{ fontSize: '0.75rem', color: '#334155', padding: '8px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div>{act.description}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: 2 }}>
                        {new Date(act.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', background: '#f8fafc' }}>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (window.confirm(`Delete lead ${lead?.company_name}?`)) {
                onDeleteLead(leadId);
                onClose();
              }
            }}
          >
            <Trash2 size={14} /> Delete Lead
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
