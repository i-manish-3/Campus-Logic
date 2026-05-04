'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateSchoolSettings(tenantId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const logoUrl = formData.get('logoUrl') as string;
  const signatureUrl = formData.get('signatureUrl') as string;
  const address = formData.get('address') as string;
  const contactNumber = formData.get('contactNumber') as string;
  const email = formData.get('email') as string;
  const receiptPrefix = formData.get('receiptPrefix') as string;

  try {
    // We use updateMany or find first to handle both ID and Domain lookups
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { id: tenantId },
          { domain: tenantId }
        ]
      }
    });

    if (!tenant) return { error: 'School not found' };

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        name,
        logoUrl,
        signatureUrl,
        address,
        contactNumber,
        email,
        receiptPrefix
      }
    });

    revalidatePath(`/school/${tenantId}/settings`);
    revalidatePath(`/school/${tenantId}/students`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update settings' };
  }
}
