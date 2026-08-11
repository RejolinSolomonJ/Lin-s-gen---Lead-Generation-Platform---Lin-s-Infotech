const app = require('./app');
const config = require('./config');
const { initializeJobs } = require('./modules/jobs/jobs.service');

async function start() {
  try {
    app.listen(config.port, () => {
      console.log(`\n🚀 Lead Generation API running on port ${config.port}`);
      console.log(`   Environment: ${config.nodeEnv}`);
      console.log(`   Client URL: ${config.clientUrl}`);
      console.log(`   Health: http://localhost:${config.port}/api/health\n`);
    });

    // Initialize background jobs
    if (config.nodeEnv !== 'test') {
      initializeJobs();
    }
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
