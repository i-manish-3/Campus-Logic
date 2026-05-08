'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function searchParents(tenantIdOrDomain: string, query: string) {
  try {
    // RESOLVE ACTUAL TENANT ID (Handles slug vs ID mismatch)
    const tenant = await prisma.tenant.findUnique({ where: { domain: tenantIdOrDomain } }) ||
      await prisma.tenant.findUnique({ where: { id: tenantIdOrDomain } });

    if (!tenant) return [];
    const tenantId = tenant.id;

    // DIAGNOSTIC: Check if 'hello' exists in any tenant
    const globalCheck = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query } },
          { email: { contains: query } }
        ]
      },
      select: { firstName: true, email: true, tenantId: true },
      take: 5
    });
    console.log("GLOBAL_SEARCH_DIAGNOSTIC:", { query, matchesFound: globalCheck });

    const totalParents = await prisma.parentProfile.count({ where: { tenantId } });
    console.log("TENANT_SEARCH_DIAGNOSTIC:", { tenantId, query, totalParentsInTenant: totalParents });

    const parents = await prisma.parentProfile.findMany({
      where: {
        tenantId,
        user: {
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { email: { contains: query } },
            { contactNumber: { contains: query } }
          ]
        }
      },
      include: {
        user: true,
        students: {
          select: { user: { select: { firstName: true, lastName: true } } }
        }
      },
      take: 5
    });

    if (parents.length === 0) {
      // Find where 'hello' actually is
      const whereIsIt = await prisma.user.findMany({
        where: {
          OR: [
            { firstName: { contains: query } },
            { email: { contains: query } }
          ]
        },
        select: { tenantId: true, firstName: true },
        take: 3
      });

      if (whereIsIt.length > 0) {
        return [{
          id: 'error',
          name: `Found "${query}" in a different school!`,
          email: `Tenant ID: ${whereIsIt[0].tenantId}`,
          phone: 'This record belongs to another school account.',
          wards: 'Access Denied'
        }];
      }
    }

    return parents.map(p => ({
      id: p.id,
      name: `${p.user.firstName} ${p.user.lastName}`,
      email: p.user.email,
      phone: p.user.contactNumber,
      wards: p.students.map(s => s.user.firstName).join(', ')
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function resetParentPassword(tenantId: string, parentProfileId: string) {
  try {
    const parent = await prisma.parentProfile.findUnique({
      where: { id: parentProfileId },
      include: { user: true }
    });

    if (!parent) return { error: 'Parent not found' };

    const newPass = 'parent123';
    const passwordHash = crypto.createHash('sha256').update(newPass).digest('hex');

    await prisma.user.update({
      where: { id: parent.userId },
      data: { passwordHash }
    });

    return { success: true, message: `Password reset to "${newPass}"` };
  } catch (error: any) {
    return { error: error.message || 'Failed to reset password' };
  }
}

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

import { getSession } from '@/lib/session';
import { ensurePermission } from '@/lib/permissions';

export async function admitStudent(tenantId: string, data: any) {
  const session = await getSession();
  if (!session) return { error: 'Authentication required' };
  
  try {
    await ensurePermission(session.userId, 'manage_admission');
    const {
      academicYear, admissionNumber, registrationNumber, admissionDate, fullName,
      username, password, dob, gender, rollNumber, bloodGroup,
      nationalId, penNumber, samagraId, apaarId, udiseId,
      height, weight, studentPhoto,
      motherName, motherOccupation, motherQualification, motherEmail, motherAadhaar, motherIncome, motherContact,
      fatherName, fatherOccupation, fatherQualification, fatherEmail, fatherAadhaar, fatherIncome, fatherContact,
      motherTongue, ewsStatus, singleGirlChild, divyangStatus,
      permStreet, permLandmark, permArea, permCity, permState, permCountry, permPincode,
      localStreet, localLandmark, localArea, localCity, localState, localCountry, localPincode,
      village, post, policeStation, wardNumber,
      classId, admissionSession, medium, religion, category, caste, areaType, medicalHistory,
      prevSchoolName, affiliatedTo, prevSchoolAddress, lastClassAttended, prevResult, tcNumber, tcDate,
      transportRouteId, transportStop, hostelName, roomNumber, bedNumber,
      bankAccountNumber, ifscCode, feeGroup, feeIdConcession, monthlyFeeDiscount, transportDiscount,
      docBirthCertificate, docTransferCertificate, docStudentPhoto, docFatherPhoto, docMotherPhoto,
      docIncomeCert, docEwsCert, docCasteCert
    } = data;

    // Perform everything in a transaction for safety
    const studentProfile = await prisma.$transaction(async (tx) => {
      // 1. Resolve Session
      let session = await tx.academicSession.findFirst({
        where: { tenantId, name: academicYear }
      });
      
      if (!session) {
        session = await tx.academicSession.create({
          data: {
            name: academicYear,
            startDate: new Date(new Date().getFullYear(), 3, 1),
            endDate: new Date(new Date().getFullYear() + 1, 2, 31),
            isActive: true,
            tenantId
          }
        });
      }

      // 2. Resolve Roles
      let [studentRole, parentRole] = await Promise.all([
        tx.role.findUnique({ where: { name_tenantId: { name: 'STUDENT', tenantId } } }),
        tx.role.findUnique({ where: { name_tenantId: { name: 'PARENT', tenantId } } })
      ]);

      if (!studentRole) studentRole = await tx.role.create({ data: { name: 'STUDENT', isSystem: true, tenantId } });
      if (!parentRole) parentRole = await tx.role.create({ data: { name: 'PARENT', isSystem: true, tenantId } });

      // 3. Handle Parent
      let parentProfileId: string | undefined;
      if (fatherEmail || fatherContact) {
        const parentEmail = fatherEmail || `${fatherContact}@mda.com`;
        let parentUser = await tx.user.findFirst({
          where: { email: parentEmail, tenantId }
        });

        if (!parentUser) {
          const passwordHash = crypto.createHash('sha256').update('parent123').digest('hex');
          parentUser = await tx.user.create({
            data: {
              email: parentEmail,
              firstName: fatherName?.split(' ')[0] || 'Father',
              lastName: fatherName?.split(' ').slice(1).join(' ') || '',
              passwordHash,
              role: { connect: { id: parentRole.id } },
              tenant: { connect: { id: tenantId } }
            }
          });
        }

        let parentProfile = await tx.parentProfile.findUnique({
          where: { userId: parentUser.id }
        });

        if (!parentProfile) {
          parentProfile = await tx.parentProfile.create({
            data: {
              userId: parentUser.id,
              tenantId
            }
          });
        }
        parentProfileId = parentProfile.id;
      }

      // 4. Create Student User
      const studentUsername = username || `std${registrationNumber?.replace(/[^a-zA-Z0-9]/g, '')}`;
      const studentEmail = `${studentUsername}@mda.com`;
      const passwordHash = crypto.createHash('sha256').update(password || 'student123').digest('hex');

      const studentUser = await tx.user.create({
        data: {
          email: studentEmail,
          firstName: fullName?.split(' ')[0] || 'Student',
          lastName: fullName?.split(' ').slice(1).join(' ') || '',
          passwordHash,
          role: { connect: { id: studentRole.id } },
          tenant: { connect: { id: tenantId } }
        }
      });

      // 5. Create Student Profile
      const profile = await tx.studentProfile.create({
        data: {
          userId: studentUser.id,
          tenantId,
          admissionNumber: admissionNumber || registrationNumber,
          registrationNumber,
          admissionDate: new Date(admissionDate),
          rollNumber,
          dob: dob ? new Date(dob) : null,
          fatherName,
          motherName,
          bloodGroup,
          gender,
          category,
          religion,
          caste,
          motherTongue,
          nationalId,
          penNumber, samagraId, apaarId, udiseId,
          height, weight,
          photo: studentPhoto,
          
          motherOccupation, motherEmail, motherQualification, motherAadhaar, motherIncome, motherContact,
          fatherOccupation, fatherEmail, fatherQualification, fatherAadhaar, fatherIncome, fatherContact,

          ewsStatus: ewsStatus === 'yes',
          singleGirlChild: singleGirlChild === 'yes',
          divyangStatus: divyangStatus === 'yes',

          permStreet, permLandmark, permArea, permCity, permState, permCountry, permPincode,
          localStreet, localLandmark, localArea, localCity, localState, localCountry, localPincode,
          village, post, policeStation, wardNumber,

          medium, areaType, medicalHistory,
          prevSchoolName, prevSchoolAddress, lastClassAttended, prevResult, affiliatedTo, tcNumber,
          tcDate: tcDate ? new Date(tcDate) : null,

          hostelName, roomNumber, bedNumber,
          bankAccountNumber, ifscCode, feeGroup, feeIdConcession,
          monthlyFeeDiscount: monthlyFeeDiscount ? parseFloat(monthlyFeeDiscount) : 0,
          transportDiscount: transportDiscount ? parseFloat(transportDiscount) : 0,

          docBirthCertificate, docTransferCertificate, docStudentPhoto, docFatherPhoto, docMotherPhoto,
          docIncomeCert, docEwsCert, docCasteCert,

          parentProfileId,
          transportRouteId: transportRouteId || null,
        }
      });

      // 5. Create Enrollment
      if (classId) {
        await tx.studentEnrollment.create({
          data: {
            studentId: profile.id,
            classId,
            sectionId: null,
            sessionId: session.id,
            tenantId
          }
        });
      }

      // 6. Auto-assign fees
      const feeStructures = await tx.feeStructure.findMany({
        where: {
          tenantId,
          sessionId: session.id,
          OR: [
            { classId, transportRouteId: null },
            { classId: null, transportRouteId: null },
            ...(profile.transportRouteId ? [{ transportRouteId: profile.transportRouteId }] : [])
          ]
        },
        include: { installments: true }
      });

      const mDiscount = parseFloat(monthlyFeeDiscount || '0');
      const tDiscount = parseFloat(transportDiscount || '0');

      for (const structure of feeStructures) {
        // Determine which discount applies to this structure
        const discountToApply = structure.transportRouteId ? tDiscount : (structure.classId ? mDiscount : 0);

        for (const installment of structure.installments) {
          const finalAmount = Math.max(0, installment.amount - discountToApply);
          
          await tx.studentFee.create({
            data: {
              studentId: profile.id,
              installmentId: installment.id,
              amountDue: finalAmount,
              tenantId
            }
          });
        }
      }

      return profile;
    });

    revalidatePath(`/school/${tenantId}/students`);
    return { success: true, studentId: studentProfile.id };
  } catch (error: any) {
    console.error('ADMISSION_ERROR:', error);
    return { success: false, error: error.message || 'Failed to admit student' };
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

export async function getStudentsBySection(tenantId: string, classId: string, sectionId?: string) {
  try {
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        tenantId,
        classId,
        ...(sectionId ? { sectionId } : {})
      },
      include: {
        student: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        student: {
          user: {
            firstName: 'asc'
          }
        }
      }
    });

    return enrollments.map(e => ({
      id: e.student.id,
      firstName: e.student.user.firstName,
      lastName: e.student.user.lastName,
      admissionNumber: e.student.admissionNumber,
      rollNumber: e.student.rollNumber
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updateRollNumbers(tenantId: string, rollData: { id: string, rollNumber: string }[]) {
  try {
    await prisma.$transaction(
      rollData.map(data =>
        prisma.studentProfile.update({
          where: { id: data.id, tenantId },
          data: { rollNumber: data.rollNumber }
        })
      )
    );

    revalidatePath(`/school/${tenantId}/students`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update roll numbers' };
  }
}


