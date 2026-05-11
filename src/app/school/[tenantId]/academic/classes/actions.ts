'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createClass(tenantId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const orderStr = formData.get('order') as string;
  const subjectIds = formData.getAll('subjects') as string[];

  if (!name) return { error: 'Class name is required' };

  const order = parseInt(orderStr, 10) || 0;

  try {
    const newClass = await prisma.class.create({
      data: {
        name,
        order,
        tenantId,
      },
    });

    // Create ClassSubject records for selected subjects
    if (subjectIds && subjectIds.length > 0) {
      await prisma.classSubject.createMany({
        data: subjectIds.map(subjectId => ({
          classId: newClass.id,
          subjectId,
          tenantId,
        })),
      });
    }

    revalidatePath(`/school/${tenantId}/academic/classes`);
    revalidatePath(`/school/${tenantId}/academic`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to create class' };
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

    revalidatePath(`/school/${tenantId}/academic/classes`);
    revalidatePath(`/school/${tenantId}/academic`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to create section' };
  }
}

export async function deleteSection(tenantId: string, sectionId: string) {
  try {
    await prisma.section.delete({
      where: { id: sectionId },
    });

    revalidatePath(`/school/${tenantId}/academic/classes`);
    revalidatePath(`/school/${tenantId}/academic`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to delete section' };
  }
}

export async function updateClassTeacher(tenantId: string, classId: string, teacherId: string) {
  try {
    await prisma.class.update({
      where: { id: classId },
      data: { teacherId },
    });

    revalidatePath(`/school/${tenantId}/academic/classes`);
    revalidatePath(`/school/${tenantId}/academic`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update class teacher' };
  }
}