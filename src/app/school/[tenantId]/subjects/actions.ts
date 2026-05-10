'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createSubject(tenantId: string, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const code = formData.get('code') as string || null;
    const sequence = parseInt(formData.get('sequence') as string) || 0;
    const type = formData.get('type') as string || 'PRIMARY';

    if (!name) {
      return { success: false, error: 'Subject name is required' };
    }

    await prisma.subject.create({
      data: {
        name,
        code,
        sequence,
        type,
        tenantId,
      },
    });

    revalidatePath(`/school/${tenantId}/subjects`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function updateSubject(tenantId: string, subjectId: string, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const code = formData.get('code') as string || null;
    const sequence = parseInt(formData.get('sequence') as string) || 0;
    const type = formData.get('type') as string || 'PRIMARY';

    if (!name) {
      return { success: false, error: 'Subject name is required' };
    }

    await prisma.subject.update({
      where: { id: subjectId },
      data: { name, code, sequence, type },
    });

    revalidatePath(`/school/${tenantId}/subjects`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function deleteSubject(tenantId: string, subjectId: string) {
  try {
    await prisma.subject.delete({
      where: { id: subjectId },
    });

    revalidatePath(`/school/${tenantId}/subjects`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}