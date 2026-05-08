import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true
        }
      }
    }
  });

  console.log('--- DATABASE ROLE REPORT ---');
  roles.forEach(role => {
    console.log(`\nRole: ${role.name} (${role.id})`);
    console.log(`Tenant: ${role.tenantId || 'GLOBAL'}`);
    console.log(`Permissions (${role.permissions.length}):`);
    role.permissions.forEach(p => {
      console.log(` - ${p.permission.action}`);
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
