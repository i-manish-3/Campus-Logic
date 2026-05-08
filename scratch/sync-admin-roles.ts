import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Find the Global Template
  const globalAdminRole = await prisma.role.findFirst({
    where: { name: 'School Admin', tenantId: null },
    include: { permissions: true }
  });

  if (!globalAdminRole) {
    console.log('No global School Admin role found.');
    return;
  }

  const permissionIds = globalAdminRole.permissions.map(p => p.permissionId);
  console.log(`Global template has ${permissionIds.length} permissions.`);

  // 2. Find all tenant-specific School Admin roles
  const tenantRoles = await prisma.role.findMany({
    where: { 
      name: 'School Admin', 
      tenantId: { not: null } 
    }
  });

  console.log(`Found ${tenantRoles.length} tenant-specific roles to sync.`);

  // 3. Sync permissions for each role
  for (const role of tenantRoles) {
    console.log(`Syncing role: ${role.id} for tenant: ${role.tenantId}`);
    
    // Clear old permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id }
    });

    // Add new permissions
    await prisma.rolePermission.createMany({
      data: permissionIds.map(pid => ({
        roleId: role.id,
        permissionId: pid
      }))
    });
  }

  console.log('Sync completed successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
