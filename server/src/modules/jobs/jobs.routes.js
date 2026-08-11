const express = require('express');
const { authMiddleware, adminOnly } = require('../../middleware/auth');
const jobsService = require('./jobs.service');

const router = express.Router();
router.use(authMiddleware);

router.post('/scan-all', adminOnly, async (req, res, next) => {
  try {
    // Start job in background, return immediately
    res.json({ message: 'Scan job started', status: 'running' });
    jobsService.triggerScanAll().catch(err => console.error('Scan job error:', err));
  } catch (err) {
    next(err);
  }
});

router.post('/enrich-all', adminOnly, async (req, res, next) => {
  try {
    res.json({ message: 'Enrichment job started', status: 'running' });
    jobsService.triggerEnrichAll().catch(err => console.error('Enrich job error:', err));
  } catch (err) {
    next(err);
  }
});

router.get('/logs', async (req, res, next) => {
  try {
    const logs = await jobsService.getJobLogs(parseInt(req.query.limit || '20', 10));
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
