import React, { useState } from 'react';
import { sourcingAPI } from '../../lib/api';
import { TAB_CATEGORIES, INDUSTRIES, REGIONS } from '../../lib/constants';
import { X, Search, Radar, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function DiscoverLeadsModal({ initialTabCategory, initialRegion, onClose, onLeadsDiscovered }) {
  const [industry, setIndustry] = useState('Clinics & Healthcare');
  const [city, setCity] = useState(initialRegion === 'international' ? 'Dubai' : 'Chennai');
  const [country, setCountry] = useState(initialRegion === 'international' ? 'UAE' : 'India');
  const [tabCategory, setTabCategory] = useState(initialTabCategory || 'no_website');
  const [region, setRegion] = useState(initialRegion || 'local');
  const [maxResults, setMaxResults] = useState(10);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
    if (newRegion === 'local') {
      setCity('Chennai');
      setCountry('India');
    } else {
      setCity('Dubai');
      setCountry('UAE');
    }
  };

  const handleDiscover = async (e) => {
    e.preventDefault();
    if (!city) {
      setError('City name is required for live discovery');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await sourcingAPI.discover({
        industry,
        city,
        country,
        tab_category: tabCategory,
        region,
        maxResults,
      });

      setResult(data);
      if (onLeadsDiscovered) {
        onLeadsDiscovered(data.leads);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Live sourcing failed. Try refining your search query.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 640, background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#d1fae5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#047857' }}>
              <Radar size={22} className={loading ? 'spin' : ''} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Live Real-Time Lead Discovery
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500, marginTop: 2 }}>
                Search real operating businesses in real-time
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} color="#64748b" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleDiscover} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Region selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Target Region
            </label>
            <div className="region-toggle" style={{ width: '100%', display: 'flex' }}>
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  style={{ flex: 1, textAlign: 'center' }}
                  className={region === r.id ? 'active' : ''}
                  onClick={() => handleRegionChange(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Category */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Target Lead Category
            </label>
            <select
              className="select-field"
              value={tabCategory}
              onChange={(e) => setTabCategory(e.target.value)}
            >
              {TAB_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label} ({cat.description})</option>
              ))}
            </select>
          </div>

          {/* Industry & Max Results */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Target Industry / Business Type
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Clinics, Restaurants, Gyms, Manufacturing"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Max Results
              </label>
              <select
                className="select-field"
                value={maxResults}
                onChange={(e) => setMaxResults(e.target.value)}
              >
                <option value="5">5 Leads</option>
                <option value="10">10 Leads</option>
                <option value="15">15 Leads</option>
                <option value="20">20 Leads</option>
              </select>
            </div>
          </div>

          {/* City & Country */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Target City *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Chennai, Coimbatore, Madurai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Country
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. India, UAE, Singapore"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Search Trigger */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: 8, padding: '12px 20px', height: 46, fontSize: '0.9375rem' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin" /> Scanning Real-Time Business Listings...
              </>
            ) : (
              <>
                <Search size={18} /> Discover Real Prospects Live
              </>
            )}
          </button>
        </form>

        {/* Results summary */}
        {result && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e2e8f0', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#047857', fontWeight: 700 }}>
                <CheckCircle2 size={18} /> Discovered {result.totalFound} real prospect(s) live!
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '2px 10px', borderRadius: 100 }}>
                Powered by {result.apiSourceUsed || 'Live API'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
              {result.leads.map((lead) => (
                <div key={lead.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.8125rem' }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>{lead.company_name}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{lead.city}, {lead.country} · {lead.contact_phone || 'No phone'}</div>
                  </div>
                  <div className={`score-badge ${lead.lead_score >= 70 ? 'score-high' : lead.lead_score >= 40 ? 'score-medium' : 'score-low'}`} style={{ width: 34, height: 34, fontSize: '0.75rem' }}>
                    {lead.lead_score}
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 12 }} onClick={onClose}>
              Done & View Discovered Leads
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
