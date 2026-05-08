'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createFeeGroup(tenantId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name) return { error: 'Name is required' };

  try {
    await prisma.feeGroup.create({
      data: {
        name,
        description,
        tenantId,
      }
    });

    revalidatePath(`/school/${tenantId}/fees/groups`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to create Fee Group' };
  }
}

export async function deleteFeeGroup(tenantId: string, groupId: string) {
  try {
    await prisma.feeGroup.delete({
      where: { id: groupId, tenantId }
    });

    revalidatePath(`/school/${tenantId}/fees/groups`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to delete Fee Group. Make sure no students are assigned to it.' };
  }
}

export async function addConcession(tenantId: string, groupId: string, formData: FormData) {
  const feeHeadId = formData.get('feeHeadId') as string;
  const discountType = formData.get('discountType') as string;
  const discountValue = parseFloat(formData.get('discountValue') as string);

  if (!feeHeadId || isNaN(discountValue)) return { error: 'Missing required fields' };

  try {
    await prisma.feeConcession.upsert({
      where: {
        feeGroupId_feeHeadId_tenantId: {
          feeGroupId: groupId,
          feeHeadId,
          tenantId
        }
      },
      update: {
        discountType,
        discountValue
      },
      create: {
        feeGroupId: groupId,
        feeHeadId,
        discountType,
        discountValue,
        tenantId
      }
    });

    revalidatePath(`/school/${tenantId}/fees/groups`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to add concession' };
  }
}

export async function removeConcession(tenantId: string, concessionId: string) {
  try {
    await prisma.feeConcession.delete({
      where: { id: concessionId }
    });

    revalidatePath(`/school/${tenantId}/fees/groups`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to remove concession' };
  }
}
