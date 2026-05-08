import prisma from './prisma';

/**
 * Checks if a user has a specific permission.
 * @param userId The ID of the user to check.
 * @param action The permission action string (e.g., 'manage_admission').
 * @returns Boolean indicating if the user has the permission.
 */
export async function hasPermission(userId: string, action: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  });

  if (!user || !user.role) return false;
  
  // Super Admins bypass all permission checks
  if (user.isSuperAdmin) return true;

  return user.role.permissions.some(rp => rp.permission.action === action);
}

/**
 * Ensures a user has a specific permission, or throws/redirects.
 * Best used in Server Actions or Server Components.
 */
export async function ensurePermission(userId: string, action: string) {
  const allowed = await hasPermission(userId, action);
  if (!allowed) {
    throw new Error(`Unauthorized: Missing required permission [${action}]`);
  }
}
