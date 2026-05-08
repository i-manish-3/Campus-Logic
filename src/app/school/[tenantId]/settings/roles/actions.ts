'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
import { ensurePermission } from '@/lib/permissions';

import { isActionAllowedInPlan } from '@/lib/plans';

export async function createTenantRole(tenantId: string, name: string, permissionIds: string[]) {
  const session = await getSession();
  if (!session) return { error: 'Auth required' };
  
  try {
    // School Admin needs permission to manage roles
    await ensurePermission(session.userId, 'manage_settings');

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error('Tenant not found');

    // Verify all permissions are allowed in this plan
    const requestedPermissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } }
    });

    for (const p of requestedPermissions) {
      if (!isActionAllowedInPlan(tenant.plan, p.action)) {
        throw new Error(`Permission [${p.action}] is not available in your ${tenant.plan} plan.`);
      }
    }

    const role = await prisma.role.create({
      data: {
        name,
        tenantId,
        isSystem: false,
        permissions: {
          create: permissionIds.map(id => ({
            permission: { connect: { id } }
          }))
        }
      }
    });
    revalidatePath(`/school/${tenantId}/settings/roles`);
    return { success: true, role };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
}

export async function updateTenantRole(tenantId: string, roleId: string, name: string, permissionIds: string[]) {
  const session = await getSession();
  if (!session) return { error: 'Auth required' };

  try {
    await ensurePermission(session.userId, 'manage_settings');

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error('Tenant not found');

    // Verify all permissions are allowed in this plan
    const requestedPermissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } }
    });

    for (const p of requestedPermissions) {
      if (!isActionAllowedInPlan(tenant.plan, p.action)) {
        throw new Error(`Permission [${p.action}] is not available in your ${tenant.plan} plan.`);
      }
    }

    await prisma.role.update({
      where: { id: roleId },
      data: { name }
    });

    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId } }),
      prisma.rolePermission.createMany({
        data: permissionIds.map(id => ({
          roleId,
          permissionId: id
        }))
      })
    ]);

    revalidatePath(`/school/${tenantId}/settings/roles`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
}

export async function deleteTenantRole(tenantId: string, roleId: string) {
  const session = await getSession();
  if (!session) return { error: 'Auth required' };

  try {
    await ensurePermission(session.userId, 'manage_settings');

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (role?.tenantId !== tenantId) throw new Error('Unauthorized role access');
    if (role?.isSystem) return { error: 'System roles cannot be deleted' };

    await prisma.role.delete({ where: { id: roleId } });
    revalidatePath(`/school/${tenantId}/settings/roles`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
}
