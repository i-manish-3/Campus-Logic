'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { verifySession, SESSION_COOKIE } from '@/lib/session';
import { cookies } from 'next/headers';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function createTenant(formData: FormData) {
  const name = formData.get('name') as string;
  const domain = formData.get('domain') as string;
  const email = formData.get('email') as string;          // school contact email
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const logoUrl = formData.get('logoUrl') as string;
  const receiptPrefix = formData.get('receiptPrefix') as string;
  const adminEmail = (formData.get('adminEmail') as string)?.trim().toLowerCase();
  const adminPassword = formData.get('adminPassword') as string;
  const adminName = (formData.get('adminName') as string)?.trim() || 'School Admin';

  if (!name || !domain) {
    return { error: 'School name and domain slug are required.' };
  }
  if (!adminEmail || !adminPassword) {
    return { error: 'Admin login email and password are required.' };
  }
  if (adminPassword.length < 6) {
    return { error: 'Admin password must be at least 6 characters.' };
  }

  const domainSlug = domain.toLowerCase().trim().replace(/\s+/g, '-');
  if (!/^[a-z0-9-]+$/.test(domainSlug)) {
    return { error: 'Domain slug can only contain lowercase letters, numbers, and hyphens.' };
  }

  try {
    const existing = await prisma.tenant.findUnique({ where: { domain: domainSlug } });
    if (existing) {
      return { error: `Domain "${domainSlug}" is already taken. Please choose a different one.` };
    }

    const emailInUse = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (emailInUse) {
      return { error: `A user with email "${adminEmail}" already exists. Please use a different email.` };
    }

    // Create tenant + admin user in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the tenant
      const tenant = await tx.tenant.create({
        data: {
          name: name.trim(),
          domain: domainSlug,
          email: email || null,
          contactNumber: phone || null,
          address: address || null,
          logoUrl: logoUrl || null,
          receiptPrefix: receiptPrefix?.toUpperCase() || 'RCPT',
          isActive: true,
        }
      });

      // 2. Create School Admin role for this tenant
      const adminRole = await tx.role.create({
        data: { name: 'School Admin', isSystem: true, tenantId: tenant.id }
      });

      // 3. Create the School Admin user
      const nameParts = adminName.split(' ');
      await tx.user.create({
        data: {
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' ') || undefined,
          email: adminEmail,
          passwordHash: hashPassword(adminPassword),
          tenantId: tenant.id,
          roleId: adminRole.id,
          isSuperAdmin: false,
          isActive: true,
        }
      });

      return tenant;
    });

    revalidatePath('/superadmin');
    revalidatePath('/superadmin/schools');
    return {
      success: true,
      tenantId: result.id,
      domain: result.domain,
      adminEmail,
      adminPassword,
    };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to create school. Please check all fields and try again.' };
  }
}


export async function toggleTenantStatus(tenantId: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { isActive: true }
    });

    if (!tenant) return { error: 'School not found.' };

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive: !tenant.isActive }
    });

    revalidatePath('/superadmin');
    revalidatePath('/superadmin/schools');
    return { success: true, isNowActive: !tenant.isActive };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update school status.' };
  }
}

export async function deleteTenant(tenantId: string) {
  try {
    // Soft delete by deactivating — real delete is too destructive
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive: false }
    });

    revalidatePath('/superadmin');
    revalidatePath('/superadmin/schools');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to delete school.' };
  }
}

export async function updateTenant(tenantId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const receiptPrefix = formData.get('receiptPrefix') as string;

  if (!name) return { error: 'School name is required.' };

  try {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: name.trim(),
        email: email || null,
        contactNumber: phone || null,
        address: address || null,
        receiptPrefix: receiptPrefix?.toUpperCase() || 'RCPT',
      }
    });

    revalidatePath('/superadmin');
    revalidatePath('/superadmin/schools');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update school details.' };
  }
}

export async function resetSchoolAdminPassword(tenantId: string, newPassword: string) {
  if (newPassword.length < 6) return { error: 'Password must be at least 6 characters.' };

  try {
    const adminRole = await prisma.role.findFirst({
      where: { tenantId, name: 'School Admin' }
    });

    if (!adminRole) {
      return { error: 'Could not find a School Admin role for this school.' };
    }

    const adminUser = await prisma.user.findFirst({
      where: { tenantId, roleId: adminRole.id }
    });

    if (!adminUser) {
      return { error: 'No admin user found for this school.' };
    }

    await prisma.user.update({
      where: { id: adminUser.id },
      data: { passwordHash: hashPassword(newPassword) }
    });

    return { success: true, email: adminUser.email };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to reset password.' };
  }
}

export async function updateSuperAdminProfile(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return { error: 'Not authenticated' };

  const session = await verifySession(token);
  if (!session || !session.isSuperAdmin) return { error: 'Not authorized' };

  const email = formData.get('email') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const password = formData.get('password') as string;

  if (!email || !firstName) return { error: 'Email and first name are required.' };

  try {
    const dataToUpdate: any = {
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName ? lastName.trim() : null,
    };

    if (password) {
      if (password.length < 6) return { error: 'Password must be at least 6 characters.' };
      dataToUpdate.passwordHash = hashPassword(password);
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: dataToUpdate
    });

    revalidatePath('/superadmin');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update profile. Email might be in use.' };
  }
}
