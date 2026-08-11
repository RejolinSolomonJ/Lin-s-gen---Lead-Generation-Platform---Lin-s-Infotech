const express = require('express');
const authController = require('./auth.controller');
const { authMiddleware, adminOnly } = require('../../middleware/auth');

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authMiddleware, adminOnly, authController.register);
router.get('/me', authMiddleware, authController.me);

module.exports = router;
