const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'naveed-sales@linsinfotechs.in';
  const password = 'salesteam1';
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (user) {
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValid);
  } else {
    console.log('User not found');
  }
}

main().finally(() => prisma.$disconnect());
