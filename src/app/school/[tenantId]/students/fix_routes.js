const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRoutes() {
  const routes = await prisma.transportRoute.findMany({
    include: { feeStructures: true, session: true }
  });

  for (const route of routes) {
    if (route.feeStructures.length === 0) {
      console.log(`Fixing route ${route.name} (Tenant: ${route.tenantId})`);
      
      let transportHead = await prisma.feeHead.findFirst({
        where: { name: 'Transport Fee', tenantId: route.tenantId }
      });

      if (!transportHead) {
        transportHead = await prisma.feeHead.create({
          data: {
            name: 'Transport Fee',
            description: 'Fees for school bus/transportation services.',
            tenantId: route.tenantId
          }
        });
      }

      const structure = await prisma.feeStructure.create({
        data: {
          feeHeadId: transportHead.id,
          sessionId: route.sessionId,
          transportRouteId: route.id,
          amount: route.feeAmount || 0,
          frequency: 'MONTHLY',
          tenantId: route.tenantId,
        }
      });

      const installments = [];
      const monthCodes = (route.activeMonths || 'APR,MAY,JUN,JUL,AUG,SEP,OCT,NOV,DEC,JAN,FEB,MAR').split(',');
      const startDate = new Date(route.session.startDate);
      
      for (let i = 0; i < 12; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + i);
        const monthCode = dueDate.toLocaleString('default', { month: 'short' }).toUpperCase();
        
        if (monthCodes.includes(monthCode)) {
          installments.push({
            feeStructureId: structure.id,
            name: 'Transport - ' + dueDate.toLocaleString('default', { month: 'long' }),
            dueDate,
            amount: route.feeAmount || 0,
          });
        }
      }

      if (installments.length > 0) {
        await prisma.feeInstallment.createMany({ data: installments });
      }
      console.log(`- Created Fee Structure and ${installments.length} installments.`);
    }
  }
}

fixRoutes();
