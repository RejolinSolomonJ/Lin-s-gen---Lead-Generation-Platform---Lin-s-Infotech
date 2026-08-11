const express = require('express');
const { authMiddleware } = require('../../middleware/auth');
const enrichmentService = require('./enrichment.service');

const router = express.Router();
router.use(authMiddleware);

// Enrich a single lead
router.post('/:leadId', async (req, res, next) => {
  try {
    const result = await enrichmentService.enrichLead(req.params.leadId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
