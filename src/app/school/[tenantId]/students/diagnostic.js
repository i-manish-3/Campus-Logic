const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const tenantId = 'demo-school'; // or the actual ID
  const tenant = await prisma.tenant.findFirst({
    where: { OR: [{ id: tenantId }, { domain: tenantId }] }
  });
  
  if (!tenant) {
    console.log('Tenant not found');
    return;
  }

  const sessions = await prisma.academicSession.findMany({
    where: { tenantId: tenant.id }
  });
  console.log('Sessions:', sessions.map(s => ({ id: s.id, name: s.name, isCurrent: s.isCurrent })));

  const structures = await prisma.feeStructure.findMany({
    where: { tenantId: tenant.id },
    include: { feeHead: true, session: true }
  });
  console.log('Fee Structures:', structures.map(s => ({ 
    id: s.id, 
    head: s.feeHead.name, 
    session: s.session.name, 
    sessionId: s.sessionId,
    classId: s.classId,
    routeId: s.transportRouteId 
  })));
}

check();
