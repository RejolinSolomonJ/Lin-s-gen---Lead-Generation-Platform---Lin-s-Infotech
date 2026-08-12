import { useState, useEffect } from 'react';
import { leadsAPI } from '../lib/api';
import { TAB_CATEGORIES, OUTREACH_STATUSES } from '../lib/constants';
import {
  TrendingUp, Users, Target, CheckCircle2, Clock, ArrowUpRight,
  Globe, Zap, BarChart3, Activity, ArrowRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [teamTimeframe, setTeamTimeframe] = useState('week');
  const [teamData, setTeamData] = useState(null);
  const [teamLoading, setTeamLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadTeamPerformance(teamTimeframe);
  }, [teamTimeframe]);

  const loadStats = async () => {
    try {
      const { data } = await leadsAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamPerformance = async (tf) => {
    setTeamLoading(true);
    try {
      const { data } = await leadsAPI.getTeamPerformance(tf);
      setTeamData(data);
    } catch (err) {
      console.error('Failed to load team performance:', err);
    } finally {
      setTeamLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: 32 }}>Dashboard</h1>
        <div className="dashboard-grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 20 }} />
          ))}
        </div>
      </div>
    );
  }

  const tabData = (stats?.leadsByTab || []).map(t => {
    const cat = TAB_CATEGORIES.find(c => c.id === t.category);
    return { name: cat?.label || t.category, count: t.count, color: cat?.color || '#059669' };
  });

  const statusData = (stats?.leadsByStatus || []).map(s => {
    const st = OUTREACH_STATUSES.find(o => o.id === s.status);
    return { name: st?.label || s.status, count: s.count, color: st?.color || '#059669' };
  });

  const localCount = stats?.leadsByRegion?.find(r => r.region === 'local')?.count || 0;
  const intlCount = stats?.leadsByRegion?.find(r => r.region === 'international')?.count || 0;

  return (
    <div className="fade-in">
      {/* Title & Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
            Dashboard
          </h1>
          <p style={{ color: '#64748b', marginTop: 2, fontSize: '0.875rem', fontWeight: 500 }}>
            Plan, qualify, and track outbound prospect leads with Lin's Gen
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="dashboard-grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
        {/* Featured Green Total Leads Card */}
        <div className="stat-card stat-card-featured">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.84375rem', color: '#a7f3d0', fontWeight: 600 }}>Total Leads</span>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight size={18} color="white" />
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>
            {stats?.totalLeads || 0}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, fontSize: '0.78125rem', color: '#d1fae5', background: 'rgba(0,0,0,0.15)', padding: '4px 10px', borderRadius: 100, width: 'fit-content' }}>
            <Globe size={13} /> {localCount} local · {intlCount} international
          </div>
        </div>

        {/* Card 2: Active Pipeline */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.84375rem', color: '#64748b', fontWeight: 600 }}>Active Pipeline</span>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={17} color="#047857" />
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {statusData.filter(s => !['won', 'lost'].includes(s.name?.toLowerCase())).reduce((sum, s) => sum + s.count, 0)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 14, fontSize: '0.78125rem', color: '#047857', fontWeight: 600 }}>
            <TrendingUp size={14} /> In progress prospects
          </div>
        </div>

        {/* Card 3: Won Deals */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.84375rem', color: '#64748b', fontWeight: 600 }}>Won Deals</span>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={17} color="#047857" />
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {statusData.find(s => s.name === 'Won')?.count || 0}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 14, fontSize: '0.78125rem', color: '#64748b' }}>
            Closed won accounts
          </div>
        </div>

        {/* Card 4: Categories */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.84375rem', color: '#64748b', fontWeight: 600 }}>Categories</span>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={17} color="#7c3aed" />
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {tabData.length}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 14, fontSize: '0.78125rem', color: '#64748b' }}>
            Active lead category tabs
          </div>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="dashboard-grid-charts" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Leads by Category Bar Chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>
            Leads Distribution by Category
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={tabData} barSize={34}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#ffffff', border: '1px solid #e2e8f0',
                  borderRadius: 12, color: '#0f172a', fontSize: '0.8125rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                }}
              />
              <Bar dataKey="count" fill="#047857" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Status Donut Chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>
            Outreach Pipeline Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={4}
                dataKey="count"
              >
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#ffffff', border: '1px solid #e2e8f0',
                  borderRadius: 12, color: '#0f172a', fontSize: '0.8125rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {statusData.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                {s.name} ({s.count})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Leads & Activity Tables */}
      <div className="dashboard-grid-tables" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Leads Card */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
            <Activity size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#047857' }} />
            Recent Prospects Discovered
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(stats?.recentLeads || []).map(lead => {
              const cat = TAB_CATEGORIES.find(c => c.id === lead.tab_category);
              return (
                <div key={lead.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 12,
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  flexWrap: 'wrap', gap: 8,
                }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{lead.company_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                      {cat?.label || lead.tab_category}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className={`score-badge ${lead.lead_score >= 70 ? 'score-high' : lead.lead_score >= 40 ? 'score-medium' : 'score-low'}`}
                      style={{ width: 34, height: 34, fontSize: '0.75rem' }}>
                      {lead.lead_score}
                    </div>
                    <span className={`status-badge status-${lead.outreach_status}`}>
                      {lead.outreach_status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
            <Clock size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#047857' }} />
            Live Audit & Outreach Logs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(stats?.recentActivities || []).slice(0, 10).map(act => (
              <div key={act.id} style={{
                padding: '10px 14px', borderRadius: 12,
                fontSize: '0.8125rem', background: '#f8fafc',
                borderLeft: '3px solid #047857', border: '1px solid #e2e8f0',
              }}>
                <div style={{ color: '#334155', fontWeight: 500 }}>
                  <strong style={{ color: '#047857' }}>{act.lead?.company_name || 'Prospect'}</strong>
                  {' — '}{act.description}
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: 4 }}>
                  {new Date(act.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Member Accounts & Performance Tracker Section */}
      <div style={{ marginTop: 28 }}>
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={20} color="#047857" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Team Member Performance & Activity Tracker
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500, marginTop: 4 }}>
                Monitor daily and weekly prospect sourcing, status updates, and activity per team member
              </p>
            </div>

            {/* Timeframe Selector Pills */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: 4, borderRadius: 12, gap: 4 }}>
              {[
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
                { id: 'all', label: 'All Time' },
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setTeamTimeframe(tf.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: teamTimeframe === tf.id ? '#ffffff' : 'transparent',
                    color: teamTimeframe === tf.id ? '#047857' : '#64748b',
                    boxShadow: teamTimeframe === tf.id ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>



          {/* Team Performance Table */}
          {teamLoading ? (
            <div className="skeleton" style={{ height: 160, borderRadius: 12 }} />
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>TEAM MEMBER</th>
                    <th>ROLE</th>
                    <th>LEADS SOURCED ({teamTimeframe.toUpperCase()})</th>
                    <th>ACTIVITIES LOGGED</th>
                    <th>MEETINGS BOOKED</th>
                    <th>DEALS WON</th>
                    <th>LAST ACTIVE</th>
                  </tr>
                </thead>
                <tbody>
                  {(teamData?.members || []).map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              background: m.role === 'admin' ? '#047857' : '#0284c7',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justify: 'center',
                              fontWeight: 800,
                              fontSize: '0.8125rem',
                            }}
                          >
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>{m.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: 100,
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            background: m.role === 'admin' ? '#d1fae5' : '#e0f2fe',
                            color: m.role === 'admin' ? '#047857' : '#0369a1',
                            textTransform: 'uppercase',
                          }}
                        >
                          {m.role}
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.9375rem', color: '#0f172a' }}>{m.leadsSourced}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: 4 }}>leads</span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.9375rem', color: '#047857' }}>{m.activitiesCount}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: 4 }}>actions</span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.9375rem', color: '#d97706' }}>{m.meetingsBooked}</strong>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.9375rem', color: '#16a34a' }}>{m.dealsWon}</strong>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.78125rem', color: '#334155', fontWeight: 500 }}>
                          {m.lastActivityDesc}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: 2 }}>
                          {m.lastActivity ? new Date(m.lastActivity).toLocaleString() : 'No activity logged'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
