const express = require('express');
const leadsController = require('./leads.controller');
const { authMiddleware } = require('../../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/stats', leadsController.getStats);
router.get('/export', leadsController.exportLeads);
router.get('/', leadsController.getLeads);
router.get('/:id', leadsController.getLeadById);
router.post('/', leadsController.createLead);
router.patch('/:id', leadsController.updateLead);
router.patch('/:id/status', leadsController.updateLeadStatus);
router.delete('/:id', leadsController.deleteLead);

module.exports = router;
