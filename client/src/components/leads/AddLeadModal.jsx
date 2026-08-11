import React, { useState } from 'react';
import { TAB_CATEGORIES, INDUSTRIES, REGIONS } from '../../lib/constants';
import { X, Plus } from 'lucide-react';

export default function AddLeadModal({ initialTabCategory, onClose, onLeadCreated }) {
  const [formData, setFormData] = useState({
    company_name: '',
    tab_category: initialTabCategory || 'no_website',
    region: 'local',
    industry: '',
    city: '',
    state: '',
    country: 'India',
    website_url: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    linkedin_url: '',
    source: 'manual',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name) {
      setError('Company name is required');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      await onLeadCreated(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create lead');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '-0.02em' }}>
            <Plus size={20} color="#047857" /> Add New Lead Prospect
          </h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} color="#64748b" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', fontSize: '0.8125rem', fontWeight: 600 }}>
              {error}
            </div>
          )}

          {/* Row 1: Company Name & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Company Name *
              </label>
              <input
                type="text"
                name="company_name"
                className="input-field"
                placeholder="e.g. Sri Krishna Textiles"
                value={formData.company_name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Lead Category *
              </label>
              <select
                name="tab_category"
                className="select-field"
                value={formData.tab_category}
                onChange={handleChange}
              >
                {TAB_CATEGORIES.map((tab) => (
                  <option key={tab.id} value={tab.id}>{tab.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Region & Industry */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Region *
              </label>
              <select
                name="region"
                className="select-field"
                value={formData.region}
                onChange={(e) => {
                  const r = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    region: r,
                    country: r === 'local' ? 'India' : 'United States',
                  }));
                }}
              >
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Industry
              </label>
              <select
                name="industry"
                className="select-field"
                value={formData.industry}
                onChange={handleChange}
              >
                <option value="">Select Industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: City, State, Country */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                City
              </label>
              <input
                type="text"
                name="city"
                className="input-field"
                placeholder="e.g. Chennai"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                State / Province
              </label>
              <input
                type="text"
                name="state"
                className="input-field"
                placeholder="e.g. Tamil Nadu"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Country
              </label>
              <input
                type="text"
                name="country"
                className="input-field"
                placeholder="e.g. India"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Website URL */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Website URL {formData.tab_category === 'no_website' ? '(Optional for No Website tab)' : ''}
            </label>
            <input
              type="text"
              name="website_url"
              className="input-field"
              placeholder="e.g. https://example.com"
              value={formData.website_url}
              onChange={handleChange}
            />
          </div>

          {/* Contact Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Contact Name
              </label>
              <input
                type="text"
                name="contact_name"
                className="input-field"
                placeholder="e.g. Rajesh Kumar"
                value={formData.contact_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Contact Email
              </label>
              <input
                type="email"
                name="contact_email"
                className="input-field"
                placeholder="e.g. rajesh@example.com"
                value={formData.contact_email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Contact Phone
              </label>
              <input
                type="text"
                name="contact_phone"
                className="input-field"
                placeholder="e.g. +91 98765 43210"
                value={formData.contact_phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Notes / Context
            </label>
            <textarea
              name="notes"
              className="input-field"
              rows={2}
              placeholder="Initial lead details or discovery context..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Prospect Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
