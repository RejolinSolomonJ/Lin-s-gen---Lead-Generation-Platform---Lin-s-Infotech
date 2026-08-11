const cron = require('node-cron');
const prisma = require('../../config/database');
const scannerService = require('../scanning/scanner.service');
const enrichmentService = require('../enrichment/enrichment.service');
const scoringService = require('../scoring/scoring.service');

function initializeJobs() {
  console.log('[Jobs] Initializing scheduled jobs...');

  // Daily at 2 AM: Re-scan leads not checked in 7+ days
  cron.schedule('0 2 * * *', async () => {
    await runJob('daily_rescan', async () => {
      const staleLeads = await prisma.lead.findMany({
        where: {
          website_url: { not: null },
          last_checked: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        take: 50,
        orderBy: { last_checked: 'asc' },
      });

      console.log(`[Jobs] Found ${staleLeads.length} stale leads to re-scan`);
      let scanned = 0;

      for (const lead of staleLeads) {
        try {
          await scannerService.runFullScan(lead.id);
          await scoringService.scoreLeadById(lead.id);
          scanned++;
          // Rate limit: wait 2 seconds between scans
          await new Promise(r => setTimeout(r, 2000));
        } catch (err) {
          console.error(`[Jobs] Failed to scan lead ${lead.id}:`, err.message);
        }
      }

      return { scanned, total: staleLeads.length };
    });
  });

  // Weekly on Sunday at 3 AM: Re-run enrichment for unverified contacts
  cron.schedule('0 3 * * 0', async () => {
    await runJob('weekly_enrichment', async () => {
      const leads = await prisma.lead.findMany({
        where: {
          OR: [
            { contact_confidence: { not: 'verified' } },
            { contact_email: null, contact_phone: null },
          ],
        },
        take: 100,
        orderBy: { date_found: 'desc' },
      });

      console.log(`[Jobs] Found ${leads.length} leads needing enrichment`);
      let enriched = 0;

      for (const lead of leads) {
        try {
          await enrichmentService.enrichLead(lead.id);
          enriched++;
          await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
          console.error(`[Jobs] Failed to enrich lead ${lead.id}:`, err.message);
        }
      }

      return { enriched, total: leads.length };
    });
  });

  console.log('[Jobs] Scheduled jobs initialized:');
  console.log('  - Daily re-scan at 2:00 AM');
  console.log('  - Weekly enrichment on Sundays at 3:00 AM');
}

async function runJob(jobType, fn) {
  const log = await prisma.jobLog.create({
    data: { job_type: jobType, status: 'running' },
  });

  try {
    const result = await fn();
    await prisma.jobLog.update({
      where: { id: log.id },
      data: {
        status: 'completed',
        result: JSON.stringify(result),
        completed_at: new Date(),
      },
    });
    console.log(`[Jobs] ${jobType} completed:`, result);
    return result;
  } catch (err) {
    await prisma.jobLog.update({
      where: { id: log.id },
      data: {
        status: 'failed',
        error: err.message,
        completed_at: new Date(),
      },
    });
    console.error(`[Jobs] ${jobType} failed:`, err.message);
    throw err;
  }
}

// Manual job triggers
async function triggerScanAll() {
  return runJob('manual_scan_all', async () => {
    const leads = await prisma.lead.findMany({
      where: { website_url: { not: null } },
      take: 100,
      orderBy: { last_checked: 'asc' },
    });

    let scanned = 0;
    for (const lead of leads) {
      try {
        await scannerService.runFullScan(lead.id);
        await scoringService.scoreLeadById(lead.id);
        scanned++;
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        console.error(`[Jobs] Scan failed for ${lead.id}:`, err.message);
      }
    }
    return { scanned, total: leads.length };
  });
}

async function triggerEnrichAll() {
  return runJob('manual_enrich_all', async () => {
    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          { contact_email: null },
          { contact_phone: null },
          { contact_confidence: { not: 'verified' } },
        ],
      },
      take: 100,
    });

    let enriched = 0;
    for (const lead of leads) {
      try {
        await enrichmentService.enrichLead(lead.id);
        enriched++;
        await new Promise(r => setTimeout(r, 1000));
      } catch (err) {
        console.error(`[Jobs] Enrich failed for ${lead.id}:`, err.message);
      }
    }
    return { enriched, total: leads.length };
  });
}

async function getJobLogs(limit = 20) {
  return prisma.jobLog.findMany({
    orderBy: { started_at: 'desc' },
    take: limit,
  });
}

module.exports = { initializeJobs, triggerScanAll, triggerEnrichAll, getJobLogs };
