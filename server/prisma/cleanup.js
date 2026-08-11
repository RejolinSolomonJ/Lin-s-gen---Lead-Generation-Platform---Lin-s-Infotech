const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  const result = await prisma.lead.updateMany({
    where: {
      tab_category: 'no_website',
      website_url: { not: null },
    },
    data: {
      tab_category: 'weak_seo',
      pitch_angle: 'Website exists but invisible on Google — SEO retainer',
    },
  });
  console.log(`✅ Moved ${result.count} leads with websites from 'No Website' tab to 'Weak SEO' tab!`);
  await prisma.$disconnect();
}

cleanup().catch(console.error);
