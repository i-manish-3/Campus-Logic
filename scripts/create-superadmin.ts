import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  const email = 'superadmin@gmail.com';
  const password = 'superadmin123';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Superadmin already exists. Updating password and privileges...');
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hashPassword(password), isSuperAdmin: true }
    });
  } else {
    await prisma.user.create({
      data: {
        email,
        passwordHash: hashPassword(password),
        firstName: 'Super',
        lastName: 'Admin',
        isSuperAdmin: true,
        isActive: true,
      }
    });
    console.log('Created superadmin account.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
