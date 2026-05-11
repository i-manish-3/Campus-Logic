import "dotenv/config";
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
const prisma = new PrismaClient()

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log(`🚀 Starting Full-Fledged Seeding ...`)

  // --- 0. Create Demo Tenant ---
  const demoTenant = await prisma.tenant.upsert({
    where: { domain: 'demo-school' },
    update: {},
    create: {
      name: 'Demo School',
      domain: 'demo-school',
      isActive: true,
    },
  });
  console.log('✅ Seeded Demo Tenant: demo-school');

  // --- 1. Define All Granular Permissions ---
  const permissions = [
    { action: 'view_students', description: 'Can view student list and basic profiles' },
    { action: 'edit_students', description: 'Can modify student personal and academic info' },
    { action: 'manage_admission', description: 'Can admit new students and handle wizard' },
    { action: 'view_fees', description: 'Can view fee structures and payment history' },
    { action: 'collect_fees', description: 'Can record payments and generate receipts' },
    { action: 'manage_academic', description: 'Can manage classes, sections, and subjects' },
    { action: 'view_exams', description: 'Can view exam schedules and results' },
    { action: 'manage_exams', description: 'Can create exams and enter marks' },
    { action: 'manage_transport', description: 'Can manage bus routes and assignments' },
    { action: 'manage_settings', description: 'Can modify school branding and system settings' },
    { action: 'manage_staff', description: 'Can create and manage teacher/staff accounts' },
    { action: 'view_reports', description: 'Can access financial and academic reports' },
  ];

  console.log('--- Seeding Permissions ---');
  const createdPerms: any = {};
  for (const p of permissions) {
    const perm = await prisma.permission.upsert({
      where: { action: p.action },
      update: { description: p.description },
      create: p,
    });
    createdPerms[p.action] = perm.id;
  }
  console.log(`✅ Seeded ${permissions.length} permissions.`);

  // --- 2. Define Global System Roles (Templates) ---
  const globalRoles = [
    { 
      name: 'School Admin', 
      permissions: [
        'view_students', 'edit_students', 'manage_admission', 
        'view_fees', 'collect_fees', 'manage_academic', 
        'view_exams', 'manage_exams', 'manage_transport', 
        'manage_settings', 'manage_staff', 'view_reports'
      ] 
    },
    { 
      name: 'Teacher', 
      permissions: [
        'view_students', 'manage_academic', 'view_exams', 'manage_exams'
      ] 
    },
    { 
      name: 'Accountant', 
      permissions: [
        'view_fees', 'collect_fees', 'view_reports', 'view_students'
      ] 
    },
    { 
      name: 'Librarian', 
      permissions: ['view_students'] 
    },
    { 
      name: 'Parent', 
      permissions: ['view_exams'] 
    },
    { 
      name: 'Student', 
      permissions: ['view_exams'] 
    },
  ];

  console.log('--- Seeding Global Role Templates ---');
  for (const gr of globalRoles) {
    let existingRole = await prisma.role.findFirst({
      where: { name: gr.name, tenantId: null }
    });

    if (!existingRole) {
      existingRole = await prisma.role.create({
        data: { name: gr.name, isSystem: true, tenantId: null }
      });
    }

    // Sync permissions
    await prisma.rolePermission.deleteMany({ where: { roleId: existingRole.id } });
    await prisma.rolePermission.createMany({
      data: gr.permissions.map(action => ({
        roleId: existingRole!.id,
        permissionId: createdPerms[action]
      }))
    });
    console.log(`✅ Seeded Global Role: ${gr.name}`);
  }

  // --- 3. Create Initial Super Admin ---
  const superAdminHash = hashPassword('admin123');
  await prisma.user.upsert({
    where: { email: 'admin@mydigitalacademy.com' },
    update: {},
    create: {
      email: 'admin@mydigitalacademy.com',
      passwordHash: superAdminHash,
      firstName: 'Super',
      lastName: 'Admin',
      isSuperAdmin: true,
      isActive: true,
    },
  });
  console.log('✅ Seeded Super Admin: admin@mydigitalacademy.com / admin123');

  // --- 4. Create Demo School Admin ---
  const schoolAdminRole = await prisma.role.findFirst({
    where: { name: 'School Admin', tenantId: null }
  });

  const schoolAdminHash = hashPassword('admin123');
  await prisma.user.upsert({
    where: { email: 'admin@demo-school.com' },
    update: {},
    create: {
      email: 'admin@demo-school.com',
      passwordHash: schoolAdminHash,
      firstName: 'School',
      lastName: 'Admin',
      tenantId: demoTenant.id,
      roleId: schoolAdminRole?.id,
      isSuperAdmin: false,
      isActive: true,
    },
  });
  console.log('✅ Seeded School Admin: admin@demo-school.com / admin123');

  console.log(`🏁 Full Seeding Finished. System is ready.`);
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
