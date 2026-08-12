const leadsService = require('./leads.service');
const { stringify } = require('csv-stringify/sync');

async function getLeads(req, res, next) {
  try {
    const result = await leadsService.getLeads(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getLeadById(req, res, next) {
  try {
    const lead = await leadsService.getLeadById(req.params.id);
    res.json(lead);
  } catch (err) {
    next(err);
  }
}

async function createLead(req, res, next) {
  try {
    const lead = await leadsService.createLead({
      ...req.body,
      created_by: req.user?.id,
    });
    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
}

async function updateLead(req, res, next) {
  try {
    const lead = await leadsService.updateLead(req.params.id, req.body);
    res.json(lead);
  } catch (err) {
    next(err);
  }
}

async function updateLeadStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!leadsService.OUTREACH_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${leadsService.OUTREACH_STATUSES.join(', ')}` });
    }
    const lead = await leadsService.updateLeadStatus(req.params.id, status, req.user?.id);
    res.json(lead);
  } catch (err) {
    next(err);
  }
}

async function deleteLead(req, res, next) {
  try {
    await leadsService.deleteLead(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function exportLeads(req, res, next) {
  try {
    const leads = await leadsService.getLeadsForExport(req.query);

    const csvData = leads.map(l => ({
      Company: l.company_name,
      Industry: l.industry || '',
      City: l.city || '',
      State: l.state || '',
      Country: l.country || '',
      Region: l.region,
      Website: l.website_url || '',
      'Contact Name': l.contact_name || '',
      'Contact Email': l.contact_email || '',
      'Contact Phone': l.contact_phone || '',
      LinkedIn: l.linkedin_url || '',
      Category: l.tab_category,
      Source: l.source,
      Score: l.lead_score,
      'Pain Points': (l.pain_points || []).join('; '),
      'Pitch Angle': l.pitch_angle || '',
      Status: l.outreach_status,
      Notes: l.notes || '',
      'Date Found': l.date_found?.toISOString() || '',
    }));

    const csv = stringify(csvData, { header: true });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=leads_export_${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const stats = await leadsService.getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

async function getTeamPerformance(req, res, next) {
  try {
    const { timeframe } = req.query;
    const performance = await leadsService.getTeamPerformance(timeframe);
    res.json(performance);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLeads, getLeadById, createLead, updateLead,
  updateLeadStatus, deleteLead, exportLeads, getStats, getTeamPerformance,
};
