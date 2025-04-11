import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: {
      username: 'admin'
    }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin', 10);
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        defaultCurrency: 'EUR',
        role: 'ADMIN'
      }
    });

    console.log('Created admin user:', admin);
  } else {
    console.log('Admin user already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 