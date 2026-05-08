import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import TenantRolesClient from './TenantRolesClient';
import { getSession } from '@/lib/session';
import { ensurePermission } from '@/lib/permissions';
import { getAllowedActionsForPlan } from '@/lib/plans';

export default async function TenantRolesPage({
  params
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const session = await getSession();

  if (!session) return notFound();

  // Security check: Only School Admins (or those with manage_settings) can see this
  await ensurePermission(session.userId, 'manage_settings');

  const tenant = await prisma.tenant.findUnique({
    where: { domain: tenantId }
  }) || await prisma.tenant.findUnique({
    where: { id: tenantId }
  });

  if (!tenant) notFound();

  // Filter permissions based on the tenant's plan
  const allowedActions = getAllowedActionsForPlan(tenant.plan);

  const [roles, allPermissions] = await Promise.all([
    prisma.role.findMany({
      where: { tenantId: tenant.id },
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
      where: { action: { in: allowedActions } },
      orderBy: { action: 'asc' }
    })
  ]);

  return (
    <TenantRolesClient 
      roles={roles as any} 
      permissions={allPermissions} 
      tenantId={tenant.id} 
    />
  );
}
