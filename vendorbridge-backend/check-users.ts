import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true }
  });
  console.log('Seeded Users:', JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}
check();
