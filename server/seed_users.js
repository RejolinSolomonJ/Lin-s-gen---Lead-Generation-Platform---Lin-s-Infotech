const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const usersToCreate = [
    {
      email: 'vaishureddy26096@gmail.com',
      name: 'Veera Vasihnavi',
      password: 'vaishuvishnu2623',
      role: 'member'
    },
    {
      email: 'veeravishnu23112002@gmail.com',
      name: 'Veera Vishnu',
      password: 'vishnuvaishu2326',
      role: 'member'
    },
    {
      email: 'guest@guest.com',
      name: 'Guest',
      password: 'guest',
      role: 'guest'
    }
  ];

  for (const u of usersToCreate) {
    const hash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password_hash: hash, name: u.name, role: u.role },
      create: {
        email: u.email,
        name: u.name,
        password_hash: hash,
        role: u.role
      }
    });
    console.log(`Upserted user: ${u.email}`);
  }

  // Find admin user or create one
  const adminEmail = 'admin@linsinfotech.com'; // Adjust if different
  const adminHash = await bcrypt.hash('Rejo390rider', 10);
  
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin' }
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { password_hash: adminHash }
    });
    console.log(`Updated admin password for ${existingAdmin.email}`);
  } else {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin',
        password_hash: adminHash,
        role: 'admin'
      }
    });
    console.log(`Created admin user: ${adminEmail}`);
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
