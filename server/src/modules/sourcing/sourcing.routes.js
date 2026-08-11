const express = require('express');
const { authMiddleware } = require('../../middleware/auth');
const sourcingService = require('./sourcing.service');

const router = express.Router();
router.use(authMiddleware);

// POST /api/sourcing/discover - Discover real prospects in real-time
router.post('/discover', async (req, res, next) => {
  try {
    const { industry, city, country, tab_category, region, maxResults } = req.body;
    if (!city) {
      return res.status(400).json({ error: 'City is required for live lead discovery' });
    }

    const result = await sourcingService.discoverRealLeads({
      industry: industry || 'Local Business',
      city,
      country: country || 'India',
      tab_category: tab_category || 'no_website',
      region: region || 'local',
      maxResults: parseInt(maxResults || '10', 10),
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
