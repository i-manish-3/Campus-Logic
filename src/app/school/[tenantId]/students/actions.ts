'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function getNextAdmissionNumber(tenantId: string) {
  try {
    const lastStudent = await prisma.studentProfile.findFirst({
      where: { tenantId },
      orderBy: { admissionNumber: 'desc' },
      select: { admissionNumber: true }
    });

    if (!lastStudent) return "101"; // Start with 101 if no students exist

    const lastNum = parseInt(lastStudent.admissionNumber);
    if (isNaN(lastNum)) return lastStudent.admissionNumber + "-1"; // Fallback for non-numeric

    return (lastNum + 1).toString();
  } catch (error) {
    console.error(error);
    return "";
  }
}

export async function admitStudent(tenantId: string, formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const dobStr = formData.get('dob') as string;
  const gender = formData.get('gender') as string;
  
  const admissionNumber = formData.get('admissionNumber') as string;
  const sessionId = formData.get('sessionId') as string;
  const classId = formData.get('classId') as string;
  const sectionId = formData.get('sectionId') as string;
  const transportRouteId = formData.get('transportRouteId') as string;

  if (!firstName || !email || !admissionNumber || !sessionId || !classId) {
    return { error: 'Missing required fields' };
  }

  try {
    // Check if admission number exists for this tenant
    const existingProfile = await prisma.studentProfile.findUnique({
      where: {
        admissionNumber_tenantId: {
          admissionNumber,
          tenantId
        }
      }
    });

    if (existingProfile) {
      return { error: 'A student with this Admission Number already exists.' };
    }

    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      return { error: 'A user with this Email already exists.' };
    }

    // Get or Create "Student" Role
    let studentRole = await prisma.role.findFirst({
      where: { name: 'Student', tenantId }
    });

    if (!studentRole) {
      studentRole = await prisma.role.create({
        data: { name: 'Student', isSystem: true, tenantId }
      });
    }

    // Perform Transaction
    const studentId = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash: crypto.createHash('sha256').update('password123').digest('hex'), // Dummy password
          roleId: studentRole.id,
          tenantId
        }
      });

      // 2. Create StudentProfile
      const profile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          admissionNumber,
          dob: dobStr ? new Date(dobStr) : null,
          gender,
          transportRouteId: transportRouteId || null,
          tenantId
        }
      });

      // 3. Create Enrollment
      const enrollment = await tx.studentEnrollment.create({
        data: {
          studentId: profile.id,
          sessionId,
          classId,
          sectionId: sectionId || null,
          tenantId
        }
      });

      // 4. AUTO-ASSIGN FEES based on Class Fee Structure + Transport
      const feeStructures = await tx.feeStructure.findMany({
        where: {
          tenantId,
          sessionId: enrollment.sessionId,
          OR: [
            { classId: enrollment.classId, transportRouteId: null },
            { classId: null, transportRouteId: null }, // Standard school fees
            ...(profile.transportRouteId ? [{ transportRouteId: profile.transportRouteId }] : [])
          ]
        },
        include: { installments: true }
      });

      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      for (const structure of feeStructures) {
        for (const installment of structure.installments) {
          const dueDate = new Date(installment.dueDate);
          
          // CRITICAL LOGIC FOR AUDIT TRAIL: 
          // 1. If it's a ONE_TIME fee (like Admission), always add it as PENDING.
          // 2. If it's MONTHLY/QUARTERLY:
          //    - If it's in the PAST: Mark as EXEMPTED with 0 amount (so reports stay clean).
          //    - If it's NOW/FUTURE: Mark as PENDING with full amount.
          
          const isOneTime = structure.frequency === 'ONE_TIME' || structure.isAdmissionFee;
          const isDueNowOrFuture = dueDate >= currentMonthStart;

          await tx.studentFee.create({
            data: {
              studentId: profile.id,
              installmentId: installment.id,
              amountDue: (isOneTime || isDueNowOrFuture) ? installment.amount : 0,
              status: (isOneTime || isDueNowOrFuture) ? 'PENDING' : 'EXEMPTED',
              tenantId
            }
          });
        }
      }

      return profile.id;
    });

    revalidatePath(`/school/${tenantId}/students`);
    return { success: true, studentId };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to admit student. Please check details.' };
  }
}

export async function generateFeesFromStructure(tenantId: string, studentId: string) {
  try {
    const enrollment = await prisma.studentEnrollment.findFirst({
      where: { studentId, tenantId },
      include: { class: true }
    });

    if (!enrollment) return { error: 'Student enrollment not found' };

    // 1. Fetch Student Profile to check transport route
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId }
    });

    if (!student) return { error: 'Student not found' };

    // 2. Find Fee Structures for this class OR general OR student's transport route
    const feeStructures = await prisma.feeStructure.findMany({
      where: {
        tenantId,
        sessionId: enrollment.sessionId,
        OR: [
          { classId: enrollment.classId, transportRouteId: null },
          { classId: null, transportRouteId: null }, // Standard general fees
          ...(student.transportRouteId ? [{ transportRouteId: student.transportRouteId }] : [])
        ]
      },
      include: { installments: true }
    });

    let createdCount = 0;

    for (const structure of feeStructures) {
      for (const installment of structure.installments) {
        // Check if fee already exists
        const existing = await prisma.studentFee.findUnique({
          where: {
            studentId_installmentId: {
              studentId,
              installmentId: installment.id
            }
          }
        });

        if (!existing) {
          await prisma.studentFee.create({
            data: {
              studentId,
              installmentId: installment.id,
              amountDue: installment.amount,
              tenantId
            }
          });
          createdCount++;
        }
      }
    }

    revalidatePath(`/school/${tenantId}/students/${studentId}/fees`);
    return { success: true, createdCount };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate fees' };
  }
}

export async function collectPayment(tenantId: string, studentId: string, formData: FormData) {
  const studentFeeId = formData.get('studentFeeId') as string;
  const amountStr = formData.get('amount') as string;
  const method = formData.get('method') as string;
  const remarks = formData.get('remarks') as string;

  if (!studentFeeId || !amountStr || !method) return { error: 'Missing payment details' };

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) return { error: 'Invalid amount' };

  try {
    const studentFee = await prisma.studentFee.findUnique({
      where: { id: studentFeeId }
    });

    if (!studentFee) return { error: 'Fee record not found' };

    await prisma.$transaction(async (tx) => {
      // 1. Record payment
      await tx.feePayment.create({
        data: {
          studentFeeId,
          amount,
          paymentMethod: method,
          remarks,
          tenantId
        }
      });

      // 2. Update StudentFee
      const newPaid = studentFee.amountPaid + amount;
      const status = newPaid >= studentFee.amountDue ? 'PAID' : (newPaid > 0 ? 'PARTIAL' : 'PENDING');

      await tx.studentFee.update({
        where: { id: studentFeeId },
        data: {
          amountPaid: newPaid,
          status
        }
      });
    });

    revalidatePath(`/school/${tenantId}/students/${studentId}/fees`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to record payment' };
  }
}

export async function updateStudentProfile(tenantId: string, studentId: string, formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const transportRouteId = formData.get('transportRouteId') as string;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Find Student to get User ID
      const existing = await tx.studentProfile.findUnique({
        where: { id: studentId },
        select: { userId: true, transportRouteId: true }
      });

      if (!existing) throw new Error('Student not found');

      // 2. Update User Info
      await tx.user.update({
        where: { id: existing.userId },
        data: { firstName, lastName, email }
      });

      // 3. Update Student Profile & Transport
      const routeId = transportRouteId || null;
      await tx.studentProfile.update({
        where: { id: studentId },
        data: { transportRouteId: routeId }
      });

      // 4. Handle Transport Fee Sync
      if (routeId !== existing.transportRouteId) {
        // A. Remove UNPAID fees from the OLD route
        if (existing.transportRouteId) {
          // Find fee structures for the old route
          const oldStructures = await tx.feeStructure.findMany({
            where: { transportRouteId: existing.transportRouteId, tenantId },
            include: { installments: true }
          });

          const oldInstallmentIds = oldStructures.flatMap(s => s.installments.map(i => i.id));
          
          // Delete only PENDING fees for these installments
          await tx.studentFee.deleteMany({
            where: {
              studentId,
              installmentId: { in: oldInstallmentIds },
              status: 'PENDING',
              amountPaid: 0
            }
          });
        }

        // B. Add fees for the NEW route
        if (routeId) {
          const session = await tx.academicSession.findFirst({
            where: { tenantId, isCurrent: true }
          });

          if (session) {
            const feeStructure = await tx.feeStructure.findFirst({
              where: { transportRouteId: routeId, sessionId: session.id, tenantId },
              include: { installments: true }
            });

            if (feeStructure) {
              for (const installment of feeStructure.installments) {
                const feeExists = await tx.studentFee.findUnique({
                  where: { studentId_installmentId: { studentId, installmentId: installment.id } }
                });

                if (!feeExists) {
                  await tx.studentFee.create({
                    data: {
                      studentId,
                      installmentId: installment.id,
                      amountDue: installment.amount,
                      tenantId
                    }
                  });
                }
              }
            }
          }
        }
      }
    });

    revalidatePath(`/school/${tenantId}/students`);
    revalidatePath(`/school/${tenantId}/students/${studentId}/fees`);
    revalidatePath(`/school/${tenantId}/fees`);
    return { success: true };
  } catch (error) {

    console.error(error);
    return { error: 'Failed to update profile' };
  }
}

export async function collectBulkPayment(tenantId: string, studentId: string, formData: FormData) {
  const feeIdsJson = formData.get('feeIds') as string;
  const method = formData.get('method') as string;
  const remarks = formData.get('remarks') as string;

  if (!feeIdsJson || !method) return { error: 'Missing payment details' };

  try {
    const feeIds: string[] = JSON.parse(feeIdsJson);
    if (feeIds.length === 0) return { error: 'No fees selected' };

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const prefix = tenant?.receiptPrefix || 'RCPT';
    const receiptId = `${prefix}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    await prisma.$transaction(async (tx) => {
      const fees = await tx.studentFee.findMany({
        where: { id: { in: feeIds }, tenantId }
      });

      for (const fee of fees) {
        const remaining = fee.amountDue - fee.amountPaid;
        if (remaining <= 0) continue;

        // 1. Record payment
        await tx.feePayment.create({
          data: {
            studentFeeId: fee.id,
            amount: remaining,
            paymentMethod: method,
            remarks: remarks || 'Bulk payment',
            receiptId,
            tenantId
          }
        });

        // 2. Update StudentFee
        await tx.studentFee.update({
          where: { id: fee.id },
          data: {
            amountPaid: fee.amountDue,
            status: 'PAID'
          }
        });
      }
    });

    revalidatePath(`/school/${tenantId}/students/${studentId}/fees`);
    revalidatePath(`/school/${tenantId}/fees`);
    return { success: true, receiptId };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to process bulk payment' };
  }
}

export async function toggleStudentStatus(tenantId: string, studentId: string) {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId, tenantId },
      select: { isActive: true }
    });

    if (!student) return { error: 'Student not found' };

    await prisma.studentProfile.update({
      where: { id: studentId, tenantId },
      data: { isActive: !student.isActive }
    });

    revalidatePath(`/school/${tenantId}/students`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update status' };
  }
}


