const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email1 = 'naveed-sales@linsinfotech.in';
  const email2 = 'naveed-sales@linsinfotechs.in';
  const password = 'salesteam1';
  
  const hash = await bcrypt.hash(password, 12);
  
  const user1 = await prisma.user.upsert({
    where: { email: email1 },
    update: { password_hash: hash, name: 'Naveed Sales', role: 'member' },
    create: {
      email: email1,
      password_hash: hash,
      name: 'Naveed Sales',
      role: 'member',
    },
  });
  
  const user2 = await prisma.user.upsert({
    where: { email: email2 },
    update: { password_hash: hash, name: 'Naveed Sales', role: 'member' },
    create: {
      email: email2,
      password_hash: hash,
      name: 'Naveed Sales',
      role: 'member',
    },
  });
  
  console.log('✅ Users added successfully:');
  console.log(user1.email);
  console.log(user2.email);
}

main()
  .catch((e) => {
    console.error('Error adding user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
