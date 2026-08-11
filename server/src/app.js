const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const leadsRoutes = require('./modules/leads/leads.routes');
const scannerRoutes = require('./modules/scanning/scanner.routes');
const enrichmentRoutes = require('./modules/enrichment/enrichment.routes');
const jobsRoutes = require('./modules/jobs/jobs.routes');
const sourcingRoutes = require('./modules/sourcing/sourcing.routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman) or matching client domain
    if (!origin || origin.includes('localhost') || origin.includes('vercel.app') || origin.includes('linsinfotech.in') || config.clientUrl === '*') {
      callback(null, true);
    } else {
      callback(null, true); // Allow production origins
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/scan', scannerRoutes);
app.use('/api/enrich', enrichmentRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/sourcing', sourcingRoutes);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
