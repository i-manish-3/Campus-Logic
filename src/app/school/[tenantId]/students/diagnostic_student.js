const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const studentId = 'cmowfho930018llls683ahsud';
  const tenantId = 'cmow0u5ck0000ll2wle1n3sca';

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      enrollments: true,
      fees: {
        include: {
          installment: {
            include: {
              feeStructure: {
                include: {
                  feeHead: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!student) {
    console.log('Student not found');
    return;
  }

  console.log('Student:', {
    name: student.fatherName, // Using fatherName as proxy for now
    classId: student.enrollments[0]?.classId,
    routeId: student.transportRouteId,
    stop: student.transportStop
  });

  console.log('Fees found:', student.fees.length);
  student.fees.forEach(f => {
    console.log(`- ${f.installment.name}: Due ${f.amountDue}, Paid ${f.amountPaid}, Status ${f.status} (Head: ${f.installment.feeStructure.feeHead.name})`);
  });

  // Check applicable structures
  const enrollment = student.enrollments[0];
  const session = await prisma.academicSession.findFirst({ where: { tenantId, isCurrent: true } });
  
  if (session && enrollment) {
    const applicable = await prisma.feeStructure.findMany({
      where: {
        tenantId,
        sessionId: session.id,
        OR: [
          { classId: enrollment.classId, transportRouteId: null },
          { classId: null, transportRouteId: null },
          ...(student.transportRouteId ? [{ transportRouteId: student.transportRouteId }] : [])
        ]
      },
      include: { feeHead: true }
    });
    console.log('Applicable Structures in DB:', applicable.length);
    applicable.forEach(s => console.log(`- ${s.feeHead.name} (ID: ${s.id}, Class: ${s.classId}, Route: ${s.transportRouteId})`));
  }
}

check();
