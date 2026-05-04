'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createAcademicSession(tenantId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const startDateStr = formData.get('startDate') as string;
  const endDateStr = formData.get('endDate') as string;
  const isCurrent = formData.get('isCurrent') === 'on';

  if (!name || !startDateStr || !endDateStr) {
    return { error: 'All fields are required' };
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (startDate >= endDate) {
    return { error: 'Start date must be before end date' };
  }

  try {
    // If this session is marked as current, we might want to unset others. 
    // For simplicity, we just insert.
    if (isCurrent) {
      await prisma.academicSession.updateMany({
        where: { tenantId, isCurrent: true },
        data: { isCurrent: false },
      });
    }

    await prisma.academicSession.create({
      data: {
        name,
        startDate,
        endDate,
        isCurrent,
        tenantId,
      },
    });

    revalidatePath(`/school/${tenantId}/academic`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to create Session. It may already exist.' };
  }
}

export async function createClass(tenantId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const orderStr = formData.get('order') as string;

  if (!name) return { error: 'Name is required' };

  const order = parseInt(orderStr, 10) || 0;

  try {
    await prisma.class.create({
      data: {
        name,
        order,
        tenantId,
      },
    });

    revalidatePath(`/school/${tenantId}/academic`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to create Class. It may already exist.' };
  }
}

export async function createSection(tenantId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const classId = formData.get('classId') as string;

  if (!name || !classId) return { error: 'Name and Class are required' };

  try {
    await prisma.section.create({
      data: {
        name,
        classId,
        tenantId,
      },
    });

    revalidatePath(`/school/${tenantId}/academic`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to create Section. It may already exist in this Class.' };
  }
}
