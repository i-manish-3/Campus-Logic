import prisma from '@/lib/prisma';
import RolesClient from './RolesClient';

export default async function RolesPage() {
  // Ensure default permissions exist (Seed logic within page for convenience in this demo)
  const defaultPermissions = [
    { action: 'view_students', description: 'Can view student list and profiles' },
    { action: 'edit_students', description: 'Can modify student information' },
    { action: 'manage_admission', description: 'Can admit new students' },
    { action: 'view_fees', description: 'Can view fee records and reports' },
    { action: 'collect_fees', description: 'Can record fee payments' },
    { action: 'manage_academic', description: 'Can manage classes, subjects, and sessions' },
    { action: 'view_exams', description: 'Can view exam schedules and marks' },
    { action: 'manage_exams', description: 'Can create exams and enter marks' },
    { action: 'manage_transport', description: 'Can manage routes and assignments' },
    { action: 'manage_settings', description: 'Can modify school branding and settings' },
  ];

  // Upsert permissions to ensure they exist
  await Promise.all(
    defaultPermissions.map(p => 
      prisma.permission.upsert({
        where: { action: p.action },
        update: {},
        create: p
      })
    )
  );

  const [rolesCount, permissionsData] = await Promise.all([
    prisma.role.count(),
    prisma.permission.findMany()
  ]);

  if (rolesCount === 0 && permissionsData.length > 0) {
    // Create Default Roles if none exist
    await prisma.role.createMany({
      data: [
        { name: 'School Admin', isSystem: true },
        { name: 'Teacher', isSystem: true },
        { name: 'Student', isSystem: true },
        { name: 'Parent', isSystem: true },
      ]
    });
  }

  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({
      where: { tenantId: null },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.permission.findMany({
      orderBy: { action: 'asc' }
    })
  ]);

  return <RolesClient roles={roles as any} permissions={permissions} />;
}
