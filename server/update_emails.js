const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const updates = [
    { oldEmail: 'vaishureddy26096@gmail.com', newEmail: 'vaishureddy@linsinfotech.in' },
    { oldEmail: 'veeravishnu23112002@gmail.com', newEmail: 'veeravishnu@linsinfotech.in' }
  ];

  for (const u of updates) {
    const existing = await prisma.user.findUnique({ where: { email: u.oldEmail } });
    if (existing) {
      await prisma.user.update({
        where: { email: u.oldEmail },
        data: { email: u.newEmail }
      });
      console.log(`Updated ${u.oldEmail} to ${u.newEmail}`);
    } else {
      console.log(`Could not find ${u.oldEmail} to update. It might already be updated.`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
