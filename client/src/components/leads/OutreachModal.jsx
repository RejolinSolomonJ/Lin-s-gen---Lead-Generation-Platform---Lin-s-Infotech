import React, { useState, useEffect } from 'react';
import { leadsAPI } from '../../lib/api';
import { getOutreachTemplates } from '../../lib/outreachTemplates';
import { X, Mail, Phone, Send, ExternalLink, Sparkles, Check, AlertCircle, Info } from 'lucide-react';

export default function OutreachModal({ lead, onClose, onOutreachSent }) {
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'whatsapp'
  const [config, setConfig] = useState({ emailConfigured: false, whatsappConfigured: false });
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Editable fields
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [whatsappMsg, setWhatsappMsg] = useState('');

  useEffect(() => {
    if (lead) {
      // Load and replace template values
      const templates = getOutreachTemplates(lead);
      if (templates) {
        setEmailSubject(templates.subject);
        setEmailBody(templates.emailBody);
        setWhatsappMsg(templates.whatsappMessage);
      }
      loadConfig();
    }
  }, [lead]);

  const loadConfig = async () => {
    try {
      const { data } = await leadsAPI.getOutreachConfig();
      setConfig(data);
    } catch (err) {
      console.error('Failed to load outreach config:', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleSendAutomatic = async () => {
    setSending(true);
    setError('');
    try {
      await leadsAPI.sendOutreach(lead.id, {
        emailContent: emailBody,
        whatsappContent: whatsappMsg,
        subject: emailSubject,
      });
      setSuccess(true);
      setTimeout(() => {
        onOutreachSent();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to send outreach automatically.');
    } finally {
      setSending(false);
    }
  };

  const handleSendManual = async () => {
    // 1. Open Mailto link
    if (lead.contact_email && emailBody) {
      const plainText = emailBody.replace(/<[^>]*>/g, '\n'); // Simple HTML to plain text convert
      const mailtoUrl = `mailto:${encodeURIComponent(lead.contact_email)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(plainText)}`;
      window.open(mailtoUrl, '_blank');
    }

    // 2. Open WhatsApp link
    if (lead.contact_phone && whatsappMsg) {
      let cleanPhone = lead.contact_phone.replace(/[\s()\-]/g, '');
      if (!cleanPhone.startsWith('+')) {
        cleanPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
      } else {
        cleanPhone = cleanPhone.substring(1); // remove + for wa.me link
      }
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;
      // Open WhatsApp after a short delay so browser doesn't block dual windows
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 300);
    }

    // 3. Mark contacted and log in backend
    try {
      await leadsAPI.updateStatus(lead.id, 'contacted');
      // Create outreach sent log manually
      await leadsAPI.update(lead.id, {
        notes: (lead.notes || '') + `\n[Outreach launched manually via client links on ${new Date().toLocaleDateString()}]`
      });
      onOutreachSent();
      onClose();
    } catch (err) {
      console.error('Failed to log manual outreach:', err);
      onOutreachSent();
      onClose();
    }
  };

  if (!lead) return null;

  const hasEmail = !!lead.contact_email;
  const hasPhone = !!lead.contact_phone;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content fade-in" 
        style={{ 
          maxWidth: '720px', 
          background: '#ffffff', 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Sparkles size={12} /> Automated Lead Outreach
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
              Reach out to {lead.company_name}
            </h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ width: 32, height: 32 }}>
            <X size={18} />
          </button>
        </div>

        {/* Channels Configuration Status Banner */}
        {!loadingConfig && (
          <div style={{ 
            padding: '10px 24px', 
            background: '#f1f5f9', 
            borderBottom: '1px solid #e2e8f0', 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 16,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#475569'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Email Server:</span>
              {config.emailConfigured ? (
                <span style={{ color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Check size={10} /> Configured (Auto-send)
                </span>
              ) : (
                <span style={{ color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Info size={10} /> Local Link Fallback
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>WhatsApp Server:</span>
              {config.whatsappConfigured ? (
                <span style={{ color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Check size={10} /> Configured (Twilio)
                </span>
              ) : (
                <span style={{ color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Info size={10} /> Local Link Fallback
                </span>
              )}
            </div>
          </div>
        )}

        {/* Modal Main Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 12, background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ padding: '20px', borderRadius: 16, background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, margin: '20px 0' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContents: 'center', justifyContent: 'center' }}>
                <Check size={28} />
              </div>
              <h4 style={{ fontWeight: 800, fontSize: '1.0625rem' }}>Outreach Dispatched!</h4>
              <p style={{ fontSize: '0.8125rem', opacity: 0.9 }}>
                Email and WhatsApp campaign sent successfully. Lead status updated to "Contacted".
              </p>
            </div>
          )}

          {!success && (
            <>
              {/* Tab Navigation */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: 8 }}>
                <button
                  className={`btn ${activeTab === 'email' ? 'btn-ghost' : 'btn-ghost'}`}
                  style={{
                    borderRadius: '8px 8px 0 0',
                    borderBottom: activeTab === 'email' ? '2px solid var(--color-primary-600)' : '2px solid transparent',
                    color: activeTab === 'email' ? 'var(--color-primary-600)' : '#64748b',
                    padding: '8px 16px',
                    fontWeight: 700,
                  }}
                  onClick={() => setActiveTab('email')}
                >
                  <Mail size={14} /> Email Draft
                </button>
                <button
                  className={`btn ${activeTab === 'whatsapp' ? 'btn-ghost' : 'btn-ghost'}`}
                  style={{
                    borderRadius: '8px 8px 0 0',
                    borderBottom: activeTab === 'whatsapp' ? '2px solid var(--color-primary-600)' : '2px solid transparent',
                    color: activeTab === 'whatsapp' ? 'var(--color-primary-600)' : '#64748b',
                    padding: '8px 16px',
                    fontWeight: 700,
                  }}
                  onClick={() => setActiveTab('whatsapp')}
                >
                  <Phone size={14} /> WhatsApp Message
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'email' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {!hasEmail && (
                    <div style={{ padding: '8px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, color: '#b45309', fontSize: '0.75rem', fontWeight: 600 }}>
                      ⚠️ Note: This lead does not have a contact email listed.
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                      Subject Line
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Email Subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      disabled={!hasEmail}
                      style={{ background: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                      Email Body (HTML supported)
                    </label>
                    <textarea
                      className="input-field"
                      rows={8}
                      placeholder="Email Body Content..."
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      disabled={!hasEmail}
                      style={{ background: '#ffffff', fontFamily: 'monospace', fontSize: '0.8125rem', lineHeight: '1.4' }}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'whatsapp' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {!hasPhone && (
                    <div style={{ padding: '8px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, color: '#b45309', fontSize: '0.75rem', fontWeight: 600 }}>
                      ⚠️ Note: This lead does not have a phone number listed.
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                      WhatsApp Message Body
                    </label>
                    <textarea
                      className="input-field"
                      rows={8}
                      placeholder="Write message..."
                      value={whatsappMsg}
                      onChange={(e) => setWhatsappMsg(e.target.value)}
                      disabled={!hasPhone}
                      style={{ background: '#ffffff', lineHeight: '1.4' }}
                    />
                    <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Replaces markers dynamically.</span>
                      <span>{whatsappMsg.length} characters</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', background: '#f8fafc', alignItems: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={onClose} disabled={sending}>
              Cancel
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              {/* Manual Link sending */}
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={handleSendManual}
                disabled={sending || (!hasEmail && !hasPhone)}
                title="Opens mail client and WhatsApp web tab pre-filled with this content"
                style={{ borderColor: 'var(--color-primary-400)', color: 'var(--color-primary-700)' }}
              >
                <ExternalLink size={13} />
                Send via Local Apps
              </button>

              {/* Automatic server sending */}
              <button 
                className="btn btn-primary btn-sm" 
                onClick={handleSendAutomatic}
                disabled={sending || (!hasEmail && !hasPhone)}
              >
                <Send size={13} className={sending ? 'spin' : ''} />
                {sending ? 'Sending Campaign...' : 'Send Automatically'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
