import React from 'react';
import { OUTREACH_STATUSES } from '../../lib/constants';
import { ExternalLink, Phone, Mail, ChevronRight, Zap, RefreshCw, Send } from 'lucide-react';

export default function LeadTable({
  leads,
  tabCategory,
  onSelectLead,
  onStatusChange,
  onQuickScan,
  onQuickEnrich,
  onOpenOutreach,
}) {
  const renderTabDataColumns = (lead) => {
    const data = lead.tab_data || {};
    switch (tabCategory) {
      case 'no_website':
        return (
          <>
            <td>{data.primary_social_link ? (
              <a href={data.primary_social_link} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary-400)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Social Storefront <ExternalLink size={12} />
              </a>
            ) : <span style={{ color: 'var(--color-surface-500)' }}>None</span>}</td>
            <td>{data.has_physical_location ? 'Yes' : 'No'}</td>
            <td>{data.employee_count_estimate ? `${data.employee_count_estimate} est.` : 'N/A'}</td>
          </>
        );
      case 'weak_seo':
        return (
          <>
            <td>
              <span className={`score-badge ${data.pagespeed_score >= 70 ? 'score-high' : data.pagespeed_score >= 40 ? 'score-medium' : 'score-low'}`} style={{ width: 34, height: 28, fontSize: '0.75rem' }}>
                {data.pagespeed_score ?? 'N/A'}
              </span>
            </td>
            <td>
              <span className={`score-badge ${data.seo_score >= 70 ? 'score-high' : data.seo_score >= 40 ? 'score-medium' : 'score-low'}`} style={{ width: 34, height: 28, fontSize: '0.75rem' }}>
                {data.seo_score ?? 'N/A'}
              </span>
            </td>
            <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {(data.top_missing_seo_items || []).slice(0, 2).join(', ') || 'No scan yet'}
            </td>
          </>
        );
      case 'agentic_ai':
        return (
          <>
            <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {(data.detected_manual_workflows || []).join(', ') || 'Manual processes'}
            </td>
            <td style={{ color: 'var(--color-primary-300)' }}>
              {data.suggested_use_case || 'Chatbot / Bot workflow'}
            </td>
          </>
        );
      case 'maintenance':
        return (
          <>
            <td>{data.cms_detected || 'Unknown'}</td>
            <td>{data.last_content_update_estimate ? `${data.last_content_update_estimate}` : 'Unknown'}</td>
            <td>{data.broken_link_count ?? 0} broken</td>
            <td>
              <span style={{ color: data.ssl_status === 'valid' ? 'var(--color-success-400)' : 'var(--color-danger-400)', fontSize: '0.75rem', fontWeight: 600 }}>
                {data.ssl_status || 'N/A'}
              </span>
            </td>
          </>
        );
      case 'erp':
        return (
          <>
            <td>{data.current_recordkeeping || 'Spreadsheets / Paper'}</td>
            <td>{data.branch_count ? `${data.branch_count} locations` : 'Single'}</td>
            <td>{(data.suggested_erp_modules || []).join(', ') || 'Billing, Inventory'}</td>
          </>
        );
      case 'ecommerce':
        return (
          <>
            <td>{data.current_platform || 'Custom / WooCommerce'}</td>
            <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {(data.missing_features || []).join(', ') || 'Cart recovery, Gateway'}
            </td>
          </>
        );
      case 'legacy_tech':
        return (
          <>
            <td>{(data.detected_legacy_stack || []).join(', ') || 'jQuery / Flash'}</td>
            <td>{data.has_https === false ? <span style={{ color: 'var(--color-danger-400)' }}>No HTTPS</span> : <span style={{ color: 'var(--color-success-400)' }}>HTTPS</span>}</td>
          </>
        );
      case 'rfp_watch':
        return (
          <>
            <td>{data.rfp_source || 'Government Portal'}</td>
            <td style={{ color: 'var(--color-accent-400)', fontWeight: 600 }}>{data.deadline || 'Upcoming'}</td>
            <td>{data.budget_range || 'N/A'}</td>
          </>
        );
      default:
        return null;
    }
  };

  const getTabHeaders = () => {
    switch (tabCategory) {
      case 'no_website':
        return ['Social Storefront', 'Physical Store', 'Employees'];
      case 'weak_seo':
        return ['PageSpeed', 'SEO Score', 'Top Issues'];
      case 'agentic_ai':
        return ['Detected Manual Workflows', 'Suggested AI Use Case'];
      case 'maintenance':
        return ['CMS', 'Last Content Update', 'Broken Links', 'SSL Status'];
      case 'erp':
        return ['Current System', 'Branches', 'Suggested Modules'];
      case 'ecommerce':
        return ['Platform', 'Missing Features'];
      case 'legacy_tech':
        return ['Legacy Stack', 'Security'];
      case 'rfp_watch':
        return ['Source Portal', 'Deadline', 'Budget Range'];
      default:
        return [];
    }
  };

  if (!leads || leads.length === 0) {
    return (
      <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: 'var(--color-surface-400)' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-surface-300)', marginBottom: 8 }}>
          No leads found in this category
        </p>
        <p style={{ fontSize: '0.875rem' }}>
          Try adjusting your search filters or click "Add Lead" to record a new prospect.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ overflow: 'hidden' }}>
      <div className="data-table-container" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Company & Location</th>
              <th>Contact Info</th>
              {getTabHeaders().map((h) => (
                <th key={h}>{h}</th>
              ))}
              <th>Score</th>
              <th>Outreach Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => onSelectLead(lead)}>
                {/* Company Name & Location */}
                <td>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>
                    {lead.company_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-surface-400)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <span>{lead.city ? `${lead.city}, ${lead.country}` : lead.country}</span>
                    {lead.website_url && (
                      <a
                        href={lead.website_url.startsWith('http') ? lead.website_url : `https://${lead.website_url}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: 'var(--color-primary-400)', display: 'inline-flex', alignItems: 'center', gap: 2 }}
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </td>

                {/* Contact Info */}
                <td>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-surface-200)' }}>
                    {lead.contact_name || <span style={{ color: 'var(--color-surface-500)', italic: 'true' }}>No contact name</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-surface-400)', display: 'flex', gap: 8, marginTop: 2 }}>
                    {lead.contact_email && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Mail size={12} /> {lead.contact_email}
                      </span>
                    )}
                    {lead.contact_phone && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Phone size={12} /> {lead.contact_phone}
                      </span>
                    )}
                  </div>
                  {lead.contact_confidence && (
                    <div style={{ fontSize: '0.6875rem', color: lead.contact_confidence === 'verified' ? 'var(--color-success-400)' : 'var(--color-warning-400)', marginTop: 2 }}>
                      ● {lead.contact_confidence} ({lead.contact_source || 'public'})
                    </div>
                  )}
                </td>

                {/* Tab Specific Columns */}
                {renderTabDataColumns(lead)}

                {/* Lead Score */}
                <td>
                  <div className={`score-badge ${lead.lead_score >= 70 ? 'score-high' : lead.lead_score >= 40 ? 'score-medium' : 'score-low'}`}>
                    {lead.lead_score}
                  </div>
                </td>

                {/* Outreach Status */}
                <td onClick={(e) => e.stopPropagation()}>
                  <select
                    className="select-field"
                    style={{ padding: '4px 24px 4px 10px', fontSize: '0.75rem', height: 32 }}
                    value={lead.outreach_status}
                    onChange={(e) => onStatusChange(lead.id, e.target.value)}
                  >
                    {OUTREACH_STATUSES.map((st) => (
                      <option key={st.id} value={st.id}>{st.label}</option>
                    ))}
                  </select>
                </td>

                {/* Quick Actions */}
                <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                    {lead.website_url && (
                      <button
                        className="btn btn-ghost btn-icon"
                        title="Re-scan site"
                        onClick={() => onQuickScan(lead.id)}
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                    <button
                      className="btn btn-ghost btn-icon"
                      title="Enrich Contact"
                      onClick={() => onQuickEnrich(lead.id)}
                    >
                      <Zap size={14} />
                    </button>
                    {(lead.contact_email || lead.contact_phone) && onOpenOutreach && (
                      <button
                        className="btn btn-ghost btn-icon"
                        title="Send Outreach"
                        onClick={() => onOpenOutreach(lead)}
                        style={{ color: 'var(--color-primary-600)' }}
                      >
                        <Send size={14} />
                      </button>
                    )}
                    <button
                      className="btn btn-ghost btn-icon"
                      title="View Details"
                      onClick={() => onSelectLead(lead)}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
