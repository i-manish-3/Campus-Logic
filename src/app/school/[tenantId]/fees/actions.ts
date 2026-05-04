'use server';
// Deep refresh triggered

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createFeeHead(tenantId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const isRefundable = formData.get('isRefundable') === 'on';

  if (!name) return { error: 'Name is required' };

  try {
    await prisma.feeHead.create({
      data: {
        name,
        description,
        isRefundable,
        tenantId,
      },
    });

    revalidatePath(`/school/${tenantId}/fees`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to create Fee Head. It may already exist.' };
  }
}

export async function updateFeeHead(tenantId: string, headId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const isRefundable = formData.get('isRefundable') === 'on';

  if (!name) return { error: 'Name is required' };

  try {
    await prisma.feeHead.update({
      where: { id: headId, tenantId },
      data: { name, description, isRefundable }
    });

    revalidatePath(`/school/${tenantId}/fees`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update Fee Head.' };
  }
}

export async function deleteFeeHead(tenantId: string, headId: string) {
  try {
    await prisma.feeHead.delete({
      where: { id: headId, tenantId }
    });

    revalidatePath(`/school/${tenantId}/fees`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to delete Fee Head. Make sure it is not being used in any Fee Structure.' };
  }
}

export async function createFeeStructure(tenantId: string, formData: FormData) {
  const feeHeadId = formData.get('feeHeadId') as string;
  const sessionId = formData.get('sessionId') as string;
  const classId = formData.get('classId') as string;
  const amountStr = formData.get('amount') as string;
  const frequency = formData.get('frequency') as string;

  if (!feeHeadId || !sessionId || !amountStr || !frequency) {
    return { error: 'Missing required fields' };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: 'Amount must be a valid positive number' };
  }

  try {
    const session = await prisma.academicSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) return { error: 'Academic Session not found' };

    await prisma.$transaction(async (tx) => {
      const structure = await tx.feeStructure.create({
        data: {
          feeHeadId,
          sessionId,
          classId: classId === 'all' ? null : classId,
          amount,
          frequency,
          isAdmissionFee: formData.get('isAdmissionFee') === 'on',
          tenantId,
        },
      });

      // Generate Installments
      const installments = [];
      const startDate = new Date(session.startDate);

      if (frequency === 'MONTHLY') {
        for (let i = 0; i < 12; i++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(startDate.getMonth() + i);
          installments.push({
            feeStructureId: structure.id,
            name: dueDate.toLocaleString('default', { month: 'long' }) + ' Installment',
            dueDate,
            amount: amount, // Amount per month
          });
        }
      } else if (frequency === 'QUARTERLY') {
        for (let i = 0; i < 4; i++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(startDate.getMonth() + (i * 3));
          installments.push({
            feeStructureId: structure.id,
            name: 'Quarter ' + (i + 1),
            dueDate,
            amount: amount, // Amount per quarter
          });
        }
      } else {
        // YEARLY or ONE_TIME
        installments.push({
          feeStructureId: structure.id,
          name: 'Annual/Full Payment',
          dueDate: startDate,
          amount: amount,
        });
      }

      const createdInstallments = await tx.feeInstallment.createMany({
        data: installments
      });

      // --- ELITE AUTO-SYNC: Push to Students ---
      // CRITICAL: If this is an ADMISSION FEE, do NOT push to existing students.
      // Admission fees are ONLY pushed during the 'admitStudent' process.
      if (structure.isAdmissionFee) {
        return; 
      }

      const installmentRecords = await tx.feeInstallment.findMany({
        where: { feeStructureId: structure.id }
      });

      const actualClassId = classId === 'all' ? null : classId;
      
      // Find all students that should have this fee
      const students = await tx.studentProfile.findMany({
        where: {
          tenantId,
          enrollments: {
            some: {
              sessionId: sessionId,
              ...(actualClassId ? { classId: actualClassId } : {})
            }
          }
        }
      });

      // Generate StudentFee records for everyone
      const studentFees = [];
      for (const student of students) {
        for (const inst of installmentRecords) {
          studentFees.push({
            studentId: student.id,
            installmentId: inst.id,
            amountDue: inst.amount,
            tenantId
          });
        }
      }

      if (studentFees.length > 0) {
        await tx.studentFee.createMany({
          data: studentFees
        });
      }
    });

    revalidatePath(`/school/${tenantId}/fees`);
    revalidatePath(`/school/${tenantId}/students`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to create Fee Structure.' };
  }
}

export async function deleteFeeStructure(tenantId: string, structureId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Find all installments
      const installments = await tx.feeInstallment.findMany({
        where: { feeStructureId: structureId },
        select: { id: true }
      });
      const installmentIds = installments.map(i => i.id);

      // 2. Delete PENDING student fees
      await tx.studentFee.deleteMany({
        where: {
          installmentId: { in: installmentIds },
          status: 'PENDING',
          amountPaid: 0
        }
      });

      // 3. Delete the structure (Cascade will handle installments)
      await tx.feeStructure.delete({
        where: { id: structureId, tenantId }
      });
    });

    revalidatePath(`/school/${tenantId}/fees`);
    revalidatePath(`/school/${tenantId}/students`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to delete Fee Structure. It might be linked to existing student fees.' };
  }
}

export async function updateFeeStructure(tenantId: string, structureId: string, formData: FormData) {
  const feeHeadId = formData.get('feeHeadId') as string;
  const classId = formData.get('classId') as string;
  const amountStr = formData.get('amount') as string;

  if (!amountStr) return { error: 'Amount is required' };

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) return { error: 'Invalid amount' };

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update Structure
      await tx.feeStructure.update({
        where: { id: structureId, tenantId },
        data: { 
          amount,
          ...(feeHeadId ? { feeHeadId } : {}),
          classId: classId === 'all' ? null : (classId || undefined),
        }
      });

      // 2. Update Installments (Amount only for now, frequency change is dangerous)
      await tx.feeInstallment.updateMany({
        where: { feeStructureId: structureId },
        data: { amount }
      });

      // 3. Update all PENDING student fees linked to these installments
      const installments = await tx.feeInstallment.findMany({
        where: { feeStructureId: structureId },
        select: { id: true }
      });
      const installmentIds = installments.map(i => i.id);

      await tx.studentFee.updateMany({
        where: {
          installmentId: { in: installmentIds },
          status: 'PENDING',
          amountPaid: 0
        },
        data: { amountDue: amount }
      });
    });

    revalidatePath(`/school/${tenantId}/fees`);
    revalidatePath(`/school/${tenantId}/students`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update Fee Structure.' };
  }
}

