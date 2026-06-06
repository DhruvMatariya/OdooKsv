import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verify() {
  const email = 'smith@gmail.com';
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log(`User ${email} not found`);
    return;
  }

  const isMatch = await bcrypt.compare('Welcome@123', user.password);
  console.log(`User: ${email}`);
  console.log(`Password "Welcome@123" matches: ${isMatch}`);
  
  await prisma.$disconnect();
}
verify();
