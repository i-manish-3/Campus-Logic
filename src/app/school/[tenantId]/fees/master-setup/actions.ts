'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const MONTH_NAMES = [
  'April', 'May', 'June', 'July', 'August', 'September', 
  'October', 'November', 'December', 'January', 'February', 'March'
];

const FREQUENCY_MAP: Record<string, number[]> = {
  'MONTHLY': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  'QUARTERLY': [0, 3, 6, 9],
  'HALF_YEARLY': [0, 6],
  'YEARLY': [0],
  'ONE_TIME': [0]
};

export async function saveMasterSetup(tenantId: string, payload: {
  groupId: string;
  classId: string;
  sessionId: string;
  monthlyData: Record<string, Record<number, string>>;
  nonMonthlyData: Record<string, string>;
  headFrequencies: Record<string, string>;
}) {
  const { groupId, classId, sessionId, monthlyData, nonMonthlyData, headFrequencies } = payload;

  if (!sessionId) return { success: false, error: 'Session not defined.' };

  try {
    const session = await prisma.academicSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new Error('Session not found');

    await prisma.$transaction(async (tx) => {
      // Loop through each head in the group
      for (const [headId, frequency] of Object.entries(headFrequencies)) {
        
        // 1. Find or Create Structure
        let structure = await tx.feeStructure.findFirst({
          where: { tenantId, feeHeadId: headId, feeGroupId: groupId, classId, sessionId }
        });

        if (!structure) {
          structure = await tx.feeStructure.create({
            data: { tenantId, feeHeadId: headId, feeGroupId: groupId, classId, sessionId, amount: 0, frequency }
          });
        } else {
          await tx.feeStructure.update({ where: { id: structure.id }, data: { frequency } });
        }

        // 2. Clear old installments
        await tx.feeInstallment.deleteMany({ where: { feeStructureId: structure.id } });

        // 3. Generate New Installments
        const installments = [];
        let totalAmount = 0;

        if (frequency === 'MONTHLY') {
          const headData = monthlyData[headId] || {};
          for (let i = 0; i < 12; i++) {
            const amount = parseFloat(headData[i] || '0');
            if (amount > 0) {
              totalAmount += amount;
              const dueDate = new Date(session.startDate);
              dueDate.setMonth(3 + i);
              dueDate.setDate(10);
              installments.push({
                feeStructureId: structure.id,
                name: `${MONTH_NAMES[i]} Installment`,
                amount,
                dueDate
              });
            }
          }
        } else {
          const amount = parseFloat(nonMonthlyData[headId] || '0');
          if (amount > 0) {
            totalAmount = amount;
            const activeIndices = FREQUENCY_MAP[frequency] || [0];
            const amountPerInst = amount / activeIndices.length;
            
            for (const idx of activeIndices) {
              const dueDate = new Date(session.startDate);
              dueDate.setMonth(3 + idx);
              dueDate.setDate(10);
              installments.push({
                feeStructureId: structure.id,
                name: frequency === 'YEARLY' ? 'Annual Fee' : `${MONTH_NAMES[idx]} Installment`,
                amount: amountPerInst,
                dueDate
              });
            }
          }
        }

        if (installments.length > 0) {
          await tx.feeInstallment.createMany({ data: installments });
          await tx.feeStructure.update({ where: { id: structure.id }, data: { amount: totalAmount } });

          // --- SMART SYNC TO STUDENTS ---
          // Find all students who belong to this Group and Class
          const students = await tx.studentProfile.findMany({
            where: {
              tenantId,
              feeGroupId: groupId,
              enrollments: { some: { sessionId, classId } }
            },
            select: { id: true }
          });

          if (students.length > 0) {
            const studentIds = students.map(s => s.id);
            
            // 1. Get all installment IDs for this structure (old and new are handled by the deleteMany above)
            const latestInstallments = await tx.feeInstallment.findMany({
              where: { feeStructureId: structure.id }
            });

            // 2. Remove PENDING fees for this structure from these students to avoid duplicates or orphaned bills
            // We only delete 'PENDING' ones to not disturb actual payments already made
            await tx.studentFee.deleteMany({
              where: {
                studentId: { in: studentIds },
                installment: { feeStructureId: structure.id },
                status: 'PENDING',
                amountPaid: 0
              }
            });

            // 3. Create new StudentFee records for the new installments
            const studentFeeEntries = [];
            for (const studentId of studentIds) {
              for (const inst of latestInstallments) {
                studentFeeEntries.push({
                  studentId,
                  installmentId: inst.id,
                  amountDue: inst.amount,
                  tenantId
                });
              }
            }

            if (studentFeeEntries.length > 0) {
              await tx.studentFee.createMany({ data: studentFeeEntries, skipDuplicates: true });
            }
          }
        }
      }
    });

    revalidatePath(`/school/${tenantId}/fees/master-setup`);
    revalidatePath(`/school/${tenantId}/students`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}
