const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'naveed-sales@linsinfotechs.in';
  const password = 'salesteam1';
  
  const hash = await bcrypt.hash(password, 12);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { password_hash: hash, name: 'Naveed Sales', role: 'member' },
    create: {
      email,
      password_hash: hash,
      name: 'Naveed Sales',
      role: 'member',
    },
  });
  
  console.log('✅ User added successfully:', user.email);
}

main()
  .catch((e) => {
    console.error('Error adding user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
