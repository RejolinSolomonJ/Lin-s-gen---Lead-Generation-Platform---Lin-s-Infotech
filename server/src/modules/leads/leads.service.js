const prisma = require('../../config/database');

const TAB_CATEGORIES = [
  'no_website', 'weak_seo', 'agentic_ai', 'maintenance',
  'erp', 'ecommerce', 'legacy_tech', 'rfp_watch',
];

const OUTREACH_STATUSES = ['new', 'contacted', 'responded', 'meeting_booked', 'won', 'lost'];
const REGIONS = ['local', 'international'];

function parseLead(lead) {
  if (!lead) return null;
  let pain_points = [];
  let tab_data = {};

  try {
    pain_points = typeof lead.pain_points === 'string' ? JSON.parse(lead.pain_points) : (lead.pain_points || []);
  } catch { pain_points = []; }

  try {
    tab_data = typeof lead.tab_data === 'string' ? JSON.parse(lead.tab_data) : (lead.tab_data || {});
  } catch { tab_data = {}; }

  return {
    ...lead,
    pain_points,
    tab_data,
  };
}

async function getLeads(filters = {}) {
  const {
    tab_category, region, industry, city, country, state,
    outreach_status, min_score, max_score,
    source, search, sort_by, sort_order,
    page = 1, per_page = 25,
  } = filters;

  const where = {};

  if (tab_category === 'no_website') {
    where.tab_category = 'no_website';
    where.AND = [
      {
        OR: [
          { website_url: null },
          { website_url: '' },
        ],
      },
    ];
  } else if (tab_category) {
    where.tab_category = tab_category;
  }
  if (region) where.region = region;
  if (industry) where.industry = { contains: industry };
  if (city) where.city = { contains: city };
  if (country) where.country = { contains: country };
  if (state) where.state = { contains: state };
  if (outreach_status) {
    if (Array.isArray(outreach_status)) {
      where.outreach_status = { in: outreach_status };
    } else {
      where.outreach_status = outreach_status;
    }
  }
  if (source) where.source = source;

  if (min_score !== undefined || max_score !== undefined) {
    where.lead_score = {};
    if (min_score !== undefined) where.lead_score.gte = parseInt(min_score, 10);
    if (max_score !== undefined) where.lead_score.lte = parseInt(max_score, 10);
  }

  if (search) {
    where.OR = [
      { company_name: { contains: search } },
      { contact_name: { contains: search } },
      { contact_email: { contains: search } },
      { notes: { contains: search } },
    ];
  }

  const orderBy = {};
  if (sort_by) {
    orderBy[sort_by] = sort_order === 'asc' ? 'asc' : 'desc';
  } else {
    orderBy.lead_score = 'desc';
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(per_page, 10);
  const take = parseInt(per_page, 10);

  const [rawLeads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        scan_results: { orderBy: { scanned_at: 'desc' }, take: 5 },
        _count: { select: { activities: true } },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  const leads = rawLeads.map(parseLead);

  return {
    leads,
    pagination: {
      page: parseInt(page, 10),
      per_page: parseInt(per_page, 10),
      total,
      total_pages: Math.ceil(total / take),
    },
  };
}

async function getLeadById(id) {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      scan_results: { orderBy: { scanned_at: 'desc' } },
      activities: { orderBy: { created_at: 'desc' }, take: 50 },
    },
  });

  if (!lead) {
    throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
  }

  return parseLead(lead);
}

async function createLead(data) {
  const lead = await prisma.lead.create({
    data: {
      company_name: data.company_name,
      industry: data.industry,
      city: data.city,
      state: data.state,
      country: data.country,
      region: data.region || 'local',
      website_url: data.website_url,
      contact_name: data.contact_name,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      linkedin_url: data.linkedin_url,
      contact_source: data.contact_source,
      contact_confidence: data.contact_confidence,
      tab_category: data.tab_category,
      source: data.source || 'manual',
      lead_score: data.lead_score || 0,
      pain_points: JSON.stringify(data.pain_points || []),
      pitch_angle: data.pitch_angle,
      outreach_status: data.outreach_status || 'new',
      notes: data.notes,
      tab_data: JSON.stringify(data.tab_data || {}),
      created_by: data.created_by,
    },
  });

  await prisma.activity.create({
    data: {
      lead_id: lead.id,
      type: 'lead_created',
      description: `Lead "${lead.company_name}" was created`,
      performed_by: data.created_by,
    },
  });

  return parseLead(lead);
}

async function updateLead(id, data) {
  const updateData = { ...data, updated_at: new Date() };
  if (data.pain_points) updateData.pain_points = JSON.stringify(data.pain_points);
  if (data.tab_data) updateData.tab_data = JSON.stringify(data.tab_data);

  const lead = await prisma.lead.update({
    where: { id },
    data: updateData,
  });

  return parseLead(lead);
}

async function updateLeadStatus(id, status, performedBy) {
  const lead = await prisma.lead.update({
    where: { id },
    data: { outreach_status: status },
  });

  await prisma.activity.create({
    data: {
      lead_id: id,
      type: 'status_change',
      description: `Status changed to "${status}"`,
      performed_by: performedBy,
    },
  });

  return parseLead(lead);
}

async function deleteLead(id) {
  await prisma.lead.delete({ where: { id } });
  return { success: true };
}

async function getLeadsForExport(filters = {}) {
  const { tab_category, region, outreach_status, min_score, max_score } = filters;

  const where = {};
  if (tab_category) where.tab_category = tab_category;
  if (region) where.region = region;
  if (outreach_status) where.outreach_status = outreach_status;
  if (min_score !== undefined || max_score !== undefined) {
    where.lead_score = {};
    if (min_score !== undefined) where.lead_score.gte = parseInt(min_score, 10);
    if (max_score !== undefined) where.lead_score.lte = parseInt(max_score, 10);
  }

  const rawLeads = await prisma.lead.findMany({
    where,
    orderBy: { lead_score: 'desc' },
  });

  return rawLeads.map(parseLead);
}

async function getStats() {
  const [
    totalLeads,
    leadsByTab,
    leadsByStatus,
    leadsByRegion,
    recentLeads,
    recentActivities,
    avgScoreByTab,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.groupBy({ by: ['tab_category'], _count: true }),
    prisma.lead.groupBy({ by: ['outreach_status'], _count: true }),
    prisma.lead.groupBy({ by: ['region'], _count: true }),
    prisma.lead.findMany({
      orderBy: { date_found: 'desc' },
      take: 10,
      select: {
        id: true, company_name: true, tab_category: true,
        lead_score: true, outreach_status: true, date_found: true,
      },
    }),
    prisma.activity.findMany({
      orderBy: { created_at: 'desc' },
      take: 20,
      include: { lead: { select: { company_name: true } } },
    }),
    prisma.lead.groupBy({
      by: ['tab_category'],
      _avg: { lead_score: true },
    }),
  ]);

  return {
    totalLeads,
    leadsByTab: leadsByTab.map(t => ({ category: t.tab_category, count: t._count })),
    leadsByStatus: leadsByStatus.map(s => ({ status: s.outreach_status, count: s._count })),
    leadsByRegion: leadsByRegion.map(r => ({ region: r.region, count: r._count })),
    avgScoreByTab: avgScoreByTab.map(a => ({ category: a.tab_category, avgScore: Math.round(a._avg.lead_score || 0) })),
    recentLeads,
    recentActivities,
  };
}

module.exports = {
  getLeads, getLeadById, createLead, updateLead,
  updateLeadStatus, deleteLead, getLeadsForExport, getStats,
  TAB_CATEGORIES, OUTREACH_STATUSES, REGIONS,
};
