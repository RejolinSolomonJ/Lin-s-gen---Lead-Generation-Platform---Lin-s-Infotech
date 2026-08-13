const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing all leads, scan results, activities, and job logs from database...');
  
  const deletedScanResults = await prisma.scanResult.deleteMany({});
  const deletedActivities = await prisma.activity.deleteMany({});
  const deletedLeads = await prisma.lead.deleteMany({});
  const deletedJobLogs = await prisma.jobLog.deleteMany({});

  console.log(`✅ Deleted ${deletedLeads.count} leads`);
  console.log(`✅ Deleted ${deletedScanResults.count} scan results`);
  console.log(`✅ Deleted ${deletedActivities.count} activities`);
  console.log(`✅ Deleted ${deletedJobLogs.count} job logs`);
  console.log('\n🎉 All existing leads successfully cleared!');
}

main()
  .catch((e) => {
    console.error('Error clearing leads:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
