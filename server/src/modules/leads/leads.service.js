const prisma = require('../../config/database');
const outreachService = require('./outreach.service');

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
    tab_category, region, industry, city, country, state, location,
    outreach_status, min_score, max_score,
    source, search, sort_by, sort_order,
    page = 1, per_page = 25,
  } = filters;

  const where = {};
  const andConditions = [];

  if (tab_category === 'no_website') {
    where.tab_category = 'no_website';
    andConditions.push({
      OR: [
        { website_url: null },
        { website_url: '' },
      ],
    });
  } else if (tab_category) {
    where.tab_category = tab_category;
  }

  if (industry) {
    const keywords = industry
      .split(/[&/]/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 3);

    if (keywords.length > 0) {
      andConditions.push({
        OR: keywords.flatMap((kw) => [
          { industry: { contains: kw, mode: 'insensitive' } },
          { company_name: { contains: kw, mode: 'insensitive' } },
        ]),
      });
    }
  }

  if (location) {
    const parts = location.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const mainPlace = parts[0];
      const secondaryPlace = parts[parts.length - 1];
      andConditions.push({
        AND: [
          {
            OR: [
              { city: { contains: mainPlace, mode: 'insensitive' } },
              { state: { contains: mainPlace, mode: 'insensitive' } },
              { country: { contains: mainPlace, mode: 'insensitive' } },
            ],
          },
          {
            OR: [
              { city: { contains: secondaryPlace, mode: 'insensitive' } },
              { state: { contains: secondaryPlace, mode: 'insensitive' } },
              { country: { contains: secondaryPlace, mode: 'insensitive' } },
            ],
          },
        ],
      });
    } else if (parts.length === 1) {
      const part = parts[0];
      andConditions.push({
        OR: [
          { city: { contains: part, mode: 'insensitive' } },
          { state: { contains: part, mode: 'insensitive' } },
          { country: { contains: part, mode: 'insensitive' } },
        ],
      });
    }
  }

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
    andConditions.push({
      OR: [
        { company_name: { contains: search, mode: 'insensitive' } },
        { contact_name: { contains: search, mode: 'insensitive' } },
        { contact_email: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
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

async function getTeamPerformance(timeframe = 'week') {
  const now = new Date();
  let startDate = new Date();

  if (timeframe === 'today') {
    startDate.setHours(0, 0, 0, 0);
  } else if (timeframe === 'week') {
    startDate.setDate(now.getDate() - 7);
  } else if (timeframe === 'month') {
    startDate.setMonth(now.getMonth() - 1);
  } else if (timeframe === 'all') {
    startDate = new Date(0);
  } else {
    startDate.setDate(now.getDate() - 7);
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
    },
    orderBy: { name: 'asc' },
  });

  const memberStats = await Promise.all(
    users.map(async (user) => {
      const [leadsSourced, activitiesCount, meetingsBooked, dealsWon, lastActivity] = await Promise.all([
        prisma.lead.count({
          where: {
            OR: [
              { created_by: user.id },
              { created_by: user.email },
              { created_by: user.name },
            ],
            created_at: { gte: startDate },
          },
        }),
        prisma.activity.count({
          where: {
            OR: [
              { performed_by: user.id },
              { performed_by: user.email },
              { performed_by: user.name },
            ],
            created_at: { gte: startDate },
          },
        }),
        prisma.activity.count({
          where: {
            OR: [
              { performed_by: user.id },
              { performed_by: user.email },
              { performed_by: user.name },
            ],
            description: { contains: 'meeting_booked' },
            created_at: { gte: startDate },
          },
        }),
        prisma.activity.count({
          where: {
            OR: [
              { performed_by: user.id },
              { performed_by: user.email },
              { performed_by: user.name },
            ],
            description: { contains: 'won' },
            created_at: { gte: startDate },
          },
        }),
        prisma.activity.findFirst({
          where: {
            OR: [
              { performed_by: user.id },
              { performed_by: user.email },
              { performed_by: user.name },
            ],
          },
          orderBy: { created_at: 'desc' },
          select: { description: true, created_at: true },
        }),
      ]);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        leadsSourced,
        activitiesCount,
        meetingsBooked,
        dealsWon,
        lastActivity: lastActivity ? lastActivity.created_at : null,
        lastActivityDesc: lastActivity ? lastActivity.description : 'No activity logged yet',
      };
    })
  );

  const teamTotals = {
    totalMembers: users.length,
    totalSourced: memberStats.reduce((sum, m) => sum + m.leadsSourced, 0),
    totalActivities: memberStats.reduce((sum, m) => sum + m.activitiesCount, 0),
    totalMeetings: memberStats.reduce((sum, m) => sum + m.meetingsBooked, 0),
    totalDealsWon: memberStats.reduce((sum, m) => sum + m.dealsWon, 0),
  };

  return {
    timeframe,
    startDate,
    teamTotals,
    members: memberStats,
  };
}

async function sendLeadOutreach(id, { emailContent, whatsappContent, subject }, user) {
  const lead = await getLeadById(id);
  if (!lead) {
    throw new Error('Lead not found');
  }

  // 1. Send Email (if email address exists)
  let emailResult = null;
  if (lead.contact_email && emailContent) {
    emailResult = await outreachService.sendEmail({
      to: lead.contact_email,
      subject: subject || `Outreach for ${lead.company_name}`,
      html: emailContent,
    });
  }

  // 2. Send WhatsApp (if phone number exists)
  let whatsappResult = null;
  if (lead.contact_phone && whatsappContent) {
    whatsappResult = await outreachService.sendWhatsApp({
      to: lead.contact_phone,
      message: whatsappContent,
    });
  }

  // 3. Update outreach status to 'contacted'
  const updatedLead = await prisma.lead.update({
    where: { id },
    data: { outreach_status: 'contacted' },
  });

  // 4. Log outreach activity
  await prisma.activity.create({
    data: {
      lead_id: id,
      type: 'outreach_sent',
      description: `Sent outreach email to ${lead.contact_email || 'N/A'} and WhatsApp to ${lead.contact_phone || 'N/A'}`,
      performed_by: user?.id || null,
    },
  });

  return {
    lead: parseLead(updatedLead),
    emailSent: !!emailResult,
    whatsappSent: !!whatsappResult,
    emailMethod: emailResult?.method || 'none',
    whatsappMethod: whatsappResult?.method || 'none',
  };
}

module.exports = {
  getLeads, getLeadById, createLead, updateLead,
  updateLeadStatus, deleteLead, getLeadsForExport, getStats, getTeamPerformance,
  sendLeadOutreach,
  TAB_CATEGORIES, OUTREACH_STATUSES, REGIONS,
};
