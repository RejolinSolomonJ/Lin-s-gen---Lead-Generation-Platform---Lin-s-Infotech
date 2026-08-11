const prisma = require('../../config/database');

/**
 * Tab-specific scoring rubrics.
 * Each function takes a lead and its scan results, returning a 0-100 score and pain points.
 */

const SCORING_RUBRICS = {
  no_website: scoreNoWebsite,
  weak_seo: scoreWeakSeo,
  agentic_ai: scoreAgenticAi,
  maintenance: scoreMaintenance,
  erp: scoreErp,
  ecommerce: scoreEcommerce,
  legacy_tech: scoreLegacyTech,
  rfp_watch: scoreRfpWatch,
};

async function scoreLeadById(leadId) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { scan_results: true },
  });

  if (!lead) throw new Error('Lead not found');

  const parsedLead = {
    ...lead,
    pain_points: typeof lead.pain_points === 'string' ? JSON.parse(lead.pain_points) : (lead.pain_points || []),
    tab_data: typeof lead.tab_data === 'string' ? JSON.parse(lead.tab_data) : (lead.tab_data || {}),
  };

  const scoreFn = SCORING_RUBRICS[lead.tab_category];
  if (!scoreFn) {
    return { score: lead.lead_score, pain_points: parsedLead.pain_points };
  }

  const { score, pain_points, pitch_angle } = scoreFn(parsedLead);

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      lead_score: score,
      pain_points: JSON.stringify(pain_points),
      pitch_angle,
    },
  });

  return { score, pain_points, pitch_angle };
}

function scoreNoWebsite(lead) {
  let score = 60; // Base score — no website is a strong signal
  const pain_points = ['No website detected'];

  const tabData = lead.tab_data || {};

  if (tabData.has_physical_location) {
    score += 10;
    pain_points.push('Has physical location but no web presence');
  }

  if (tabData.primary_social_link) {
    score += 10;
    pain_points.push('Uses social media as storefront — needs dedicated website');
  }

  if (tabData.employee_count_estimate && tabData.employee_count_estimate > 5) {
    score += 10;
    pain_points.push(`Estimated ${tabData.employee_count_estimate}+ employees — business is established`);
  }

  // Priority industries
  const highPriorityIndustries = ['healthcare', 'clinic', 'restaurant', 'retail', 'real estate', 'education', 'gym', 'salon'];
  if (lead.industry && highPriorityIndustries.some(ind => lead.industry.toLowerCase().includes(ind))) {
    score += 10;
    pain_points.push(`${lead.industry} — high-value industry for web presence`);
  }

  return {
    score: Math.min(score, 100),
    pain_points,
    pitch_angle: 'No web presence — full website build',
  };
}

function scoreWeakSeo(lead) {
  let score = 0;
  const pain_points = [];
  const tabData = lead.tab_data || {};

  // SEO fundamentals score (from scan)
  const seoScore = tabData.seo_score || 0;
  score += Math.round((100 - seoScore) * 0.4); // Lower SEO = higher lead score

  // PageSpeed score
  const psScore = tabData.pagespeed_score || 0;
  if (psScore < 50) {
    score += 20;
    pain_points.push(`Poor PageSpeed score: ${psScore}/100`);
  } else if (psScore < 80) {
    score += 10;
    pain_points.push(`Below-average PageSpeed score: ${psScore}/100`);
  }

  // Missing SEO items
  const missingItems = tabData.top_missing_seo_items || [];
  score += Math.min(missingItems.length * 5, 30);
  missingItems.forEach(item => pain_points.push(item));

  if (seoScore < 30) {
    pain_points.push('Critical: Very low SEO score — site is invisible on Google');
  }

  return {
    score: Math.min(score, 100),
    pain_points,
    pitch_angle: 'Website exists but invisible on Google — SEO retainer',
  };
}

function scoreAgenticAi(lead) {
  let score = 30; // Base score
  const pain_points = [];
  const tabData = lead.tab_data || {};

  const workflows = tabData.detected_manual_workflows || [];
  score += Math.min(workflows.length * 10, 30);
  workflows.forEach(w => pain_points.push(w));

  if (tabData.suggested_use_case) {
    score += 15;
    pain_points.push(`Opportunity: ${tabData.suggested_use_case}`);
  }

  if (tabData.automation_roi_note) {
    score += 10;
    pain_points.push(tabData.automation_roi_note);
  }

  // Industry fit
  const highROIIndustries = ['healthcare', 'clinic', 'hospital', 'education', 'logistics', 'real estate', 'retail', 'insurance'];
  if (lead.industry && highROIIndustries.some(ind => lead.industry.toLowerCase().includes(ind))) {
    score += 15;
    pain_points.push(`${lead.industry} — high-ROI industry for AI automation`);
  }

  return {
    score: Math.min(score, 100),
    pain_points,
    pitch_angle: 'Replace manual processes with AI agents',
  };
}

function scoreMaintenance(lead) {
  let score = 0;
  const pain_points = [];
  const tabData = lead.tab_data || {};

  if (tabData.ssl_status === 'invalid') {
    score += 25;
    pain_points.push('SSL certificate is expired or invalid');
  }

  if (tabData.broken_link_count > 0) {
    score += Math.min(tabData.broken_link_count * 5, 20);
    pain_points.push(`${tabData.broken_link_count} broken link(s) detected`);
  }

  if (tabData.last_content_update_estimate) {
    const yearsStale = new Date().getFullYear() - parseInt(tabData.last_content_update_estimate, 10);
    if (yearsStale >= 2) {
      score += 20;
      pain_points.push(`Content appears ${yearsStale} years outdated`);
    }
  }

  if (tabData.cms_detected && tabData.cms_detected !== 'unknown') {
    score += 5;
    pain_points.push(`Running on ${tabData.cms_detected} — may need updates`);
  }

  // Add points from scan pain_points
  if (lead.pain_points) {
    score += Math.min(lead.pain_points.length * 3, 20);
  }

  return {
    score: Math.min(score, 100),
    pain_points,
    pitch_angle: 'Site is live but unmaintained — maintenance care plan',
  };
}

function scoreErp(lead) {
  let score = 30;
  const pain_points = [];
  const tabData = lead.tab_data || {};

  if (tabData.current_recordkeeping === 'spreadsheet' || tabData.current_recordkeeping === 'paper') {
    score += 25;
    pain_points.push(`Currently using ${tabData.current_recordkeeping}-based record keeping`);
  }

  if (tabData.branch_count && tabData.branch_count > 1) {
    score += Math.min(tabData.branch_count * 5, 20);
    pain_points.push(`Multi-location business (${tabData.branch_count} branches) — high ERP ROI`);
  }

  const suggestedModules = tabData.suggested_erp_modules || [];
  score += Math.min(suggestedModules.length * 5, 15);
  if (suggestedModules.length > 0) {
    pain_points.push(`Suggested modules: ${suggestedModules.join(', ')}`);
  }

  const erpIndustries = ['manufacturing', 'distribution', 'retail', 'hospital', 'school', 'college', 'logistics'];
  if (lead.industry && erpIndustries.some(ind => lead.industry.toLowerCase().includes(ind))) {
    score += 10;
    pain_points.push(`${lead.industry} — strong ERP use case`);
  }

  return {
    score: Math.min(score, 100),
    pain_points,
    pitch_angle: 'Run this on one system instead of five spreadsheets — custom ERP',
  };
}

function scoreEcommerce(lead) {
  let score = 20;
  const pain_points = [];
  const tabData = lead.tab_data || {};

  const missingFeatures = tabData.missing_features || [];
  score += Math.min(missingFeatures.length * 10, 40);
  missingFeatures.forEach(f => pain_points.push(`Missing: ${f}`));

  if (tabData.has_mobile_checkout === false) {
    score += 20;
    pain_points.push('No mobile checkout optimization');
  }

  if (tabData.current_platform === 'unknown') {
    score += 10;
    pain_points.push('No recognizable e-commerce platform detected');
  }

  return {
    score: Math.min(score, 100),
    pain_points,
    pitch_angle: 'Modernize your e-commerce — conversion optimization',
  };
}

function scoreLegacyTech(lead) {
  let score = 20;
  const pain_points = [];
  const tabData = lead.tab_data || {};

  const legacyStack = tabData.detected_legacy_stack || [];
  score += Math.min(legacyStack.length * 15, 45);
  legacyStack.forEach(tech => pain_points.push(`Legacy: ${tech}`));

  if (tabData.has_https === false) {
    score += 20;
    pain_points.push('Site is not using HTTPS — security risk');
  }

  return {
    score: Math.min(score, 100),
    pain_points,
    pitch_angle: 'Full tech stack rebuild — modern, secure, fast',
  };
}

function scoreRfpWatch(lead) {
  let score = 50;
  const pain_points = [];
  const tabData = lead.tab_data || {};

  if (tabData.deadline) {
    const daysUntilDeadline = Math.floor((new Date(tabData.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilDeadline > 0 && daysUntilDeadline < 14) {
      score += 30;
      pain_points.push(`Deadline in ${daysUntilDeadline} days — urgent`);
    } else if (daysUntilDeadline >= 14 && daysUntilDeadline < 30) {
      score += 20;
      pain_points.push(`Deadline in ${daysUntilDeadline} days`);
    } else if (daysUntilDeadline >= 30) {
      score += 10;
    }
  }

  const capabilities = tabData.matching_capabilities || [];
  score += Math.min(capabilities.length * 5, 20);
  if (capabilities.length > 0) {
    pain_points.push(`Matches: ${capabilities.join(', ')}`);
  }

  return {
    score: Math.min(score, 100),
    pain_points,
    pitch_angle: null,
  };
}

module.exports = { scoreLeadById, SCORING_RUBRICS };
