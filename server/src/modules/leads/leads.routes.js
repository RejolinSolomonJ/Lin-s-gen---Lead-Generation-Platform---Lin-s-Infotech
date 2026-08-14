const express = require('express');
const leadsController = require('./leads.controller');
const { authMiddleware } = require('../../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/stats', leadsController.getStats);
router.get('/team-performance', leadsController.getTeamPerformance);
router.get('/export', leadsController.exportLeads);
router.get('/outreach/config', leadsController.getOutreachConfig);
router.get('/', leadsController.getLeads);
router.get('/:id', leadsController.getLeadById);
router.post('/', leadsController.createLead);
router.post('/:id/outreach', leadsController.sendOutreach);
router.patch('/:id', leadsController.updateLead);
router.patch('/:id/status', leadsController.updateLeadStatus);
router.delete('/:id', leadsController.deleteLead);

module.exports = router;
