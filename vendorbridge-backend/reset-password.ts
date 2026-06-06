import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function reset() {
  const email = process.argv[2];
  const newPwd = process.argv[3] || 'Password123';
  if (!email) {
    console.log('Please provide an email: npx ts-node reset-password.ts user@example.com [optional_password]');
    process.exit(1);
  }

  const password = await bcrypt.hash(newPwd, 12);
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { password }
    });
    console.log(`Password reset successfully for ${email} to "${newPwd}"`);
  } catch (err) {
    console.error(`Error: User with email ${email} not found.`);
  } finally {
    await prisma.$disconnect();
  }
}

reset();
