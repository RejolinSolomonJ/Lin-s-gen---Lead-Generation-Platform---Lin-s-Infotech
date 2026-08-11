const express = require('express');
const { authMiddleware } = require('../../middleware/auth');
const scannerService = require('./scanner.service');

const router = express.Router();
router.use(authMiddleware);

// Trigger a full scan on a lead
router.post('/:leadId', async (req, res, next) => {
  try {
    const result = await scannerService.runFullScan(req.params.leadId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Run individual scans
router.post('/seo', async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    const result = await scannerService.scanSEO(url);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/pagespeed', async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    const result = await scannerService.scanPageSpeed(url);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
