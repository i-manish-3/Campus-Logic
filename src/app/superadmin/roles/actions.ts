'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createRole(tenantId: string | null, name: string, permissionIds: string[]) {
  try {
    const role = await prisma.role.create({
      data: {
        name,
        tenantId,
        isSystem: tenantId === null,
        permissions: {
          create: permissionIds.map(id => ({
            permission: { connect: { id } }
          }))
        }
      }
    });
    revalidatePath('/superadmin/roles');
    return { success: true, role };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
}

export async function updateRole(roleId: string, name: string, permissionIds: string[]) {
  try {
    // 1. Update basic info
    await prisma.role.update({
      where: { id: roleId },
      data: { name }
    });

    // 2. Sync permissions (Delete old ones, add new ones)
    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId } }),
      prisma.rolePermission.createMany({
        data: permissionIds.map(id => ({
          roleId,
          permissionId: id
        }))
      })
    ]);

    // 3. Cascade update: If this is a Global System Role, update all matching tenant roles
    const updatedRole = await prisma.role.findUnique({ where: { id: roleId } });
    if (updatedRole?.isSystem && updatedRole?.tenantId === null) {
      const matchingRoles = await prisma.role.findMany({
        where: { name: updatedRole.name, tenantId: { not: null } }
      });

      for (const tRole of matchingRoles) {
        await prisma.$transaction([
          prisma.rolePermission.deleteMany({ where: { roleId: tRole.id } }),
          prisma.rolePermission.createMany({
            data: permissionIds.map(id => ({
              roleId: tRole.id,
              permissionId: id
            }))
          })
        ]);
      }
    }

    revalidatePath('/superadmin/roles');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
}

export async function deleteRole(roleId: string) {
  try {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (role?.isSystem) return { error: 'System roles cannot be deleted' };

    await prisma.role.delete({ where: { id: roleId } });
    revalidatePath('/superadmin/roles');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
}
