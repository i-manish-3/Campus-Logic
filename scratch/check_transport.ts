
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkTransport() {
  const tenants = await prisma.tenant.findMany();
  console.log(`Found ${tenants.length} tenants`);
  
  for (const tenant of tenants) {
    console.log(`\n--- Checking Tenant: ${tenant.name} (${tenant.id}) ---`);

    const sessions = await prisma.academicSession.findMany({ where: { tenantId: tenant.id } });
    console.log("Academic Sessions:", sessions.map(s => s.name).join(', '));

    const routes = await prisma.transportRoute.findMany({ 
      where: { tenantId: tenant.id },
      include: { feeStructures: true }
    });
    console.log("Transport Routes:", routes.length);
    routes.forEach(r => {
      console.log(` - ${r.name} (Session ID: ${r.sessionId})`);
      console.log(`   - Stops: ${r.stopsJson}`);
      console.log(`   - Fee structures found: ${r.feeStructures.length}`);
    });

    const structures = await prisma.feeStructure.findMany({ 
      where: { tenantId: tenant.id, transportRouteId: { not: null } },
      include: { installments: true }
    });
    console.log("Transport Fee Structures:", structures.length);
    structures.forEach(s => {
      console.log(` - Structure ID: ${s.id}, Route ID: ${s.transportRouteId}, Session ID: ${s.sessionId}`);
      console.log(`   - Installments: ${s.installments.length}`);
    });

    const students = await prisma.studentProfile.findMany({ 
      where: { tenantId: tenant.id },
      orderBy: { admissionDate: 'desc' },
      take: 5,
      include: { user: true }
    });
    console.log("Recent Students:", students.length);
    for (const s of students) {
      console.log(` - ${s.user.firstName} (ID: ${s.id}, Route: ${s.transportRouteId}, Stop: ${s.transportStop})`);
      const fees = await prisma.studentFee.findMany({
        where: { studentId: s.id },
        include: { installment: { include: { feeStructure: true } } }
      });
      const tFees = fees.filter(f => !!f.installment.feeStructure.transportRouteId);
      console.log(`   - Total Fees: ${fees.length}, Transport Fees: ${tFees.length}`);
    }
  }
}

checkTransport()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
