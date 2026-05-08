const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function refreshStudent(studentId) {
  const tenantId = 'cmow0u5ck0000ll2wle1n3sca'; // mps

  // 1. Delete existing fees (clean slate)
  await prisma.studentFee.deleteMany({ where: { studentId } });

  // 2. Fetch profile
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { enrollments: true }
  });

  const classId = student.enrollments[0]?.classId;
  const session = await prisma.academicSession.findFirst({ where: { tenantId, isCurrent: true } });

  // 3. Find structures
  const structures = await prisma.feeStructure.findMany({
    where: {
      tenantId,
      sessionId: session.id,
      OR: [
        { classId, transportRouteId: null },
        { classId: null, transportRouteId: null },
        ...(student.transportRouteId ? [{ transportRouteId: student.transportRouteId }] : [])
      ]
    },
    include: { installments: true }
  });

  console.log(`Found ${structures.length} structures for student.`);

  // 4. Create fees
  for (const structure of structures) {
    const discount = structure.transportRouteId ? student.transportDiscount : student.monthlyFeeDiscount;
    for (const inst of structure.installments) {
      const final = Math.max(0, inst.amount - (discount || 0));
      await prisma.studentFee.create({
        data: {
          studentId,
          installmentId: inst.id,
          amountDue: final,
          tenantId
        }
      });
      console.log(`- Created ${inst.name}: Due ${final}`);
    }
  }
}

refreshStudent('cmowfho930018llls683ahsud');
