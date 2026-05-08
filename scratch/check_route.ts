
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkRouteDetails() {
  const route = await prisma.transportRoute.findFirst({
    where: { name: 'Asogi Route' }
  });
  if (route) {
    console.log("Route Details for Asogi Route:");
    console.log(`ID: ${route.id}`);
    console.log(`Session ID: ${route.sessionId}`);
    console.log(`Active Months: ${route.activeMonths}`);
    console.log(`Stops: ${route.stopsJson}`);
    
    const structures = await prisma.feeStructure.findMany({
      where: { transportRouteId: route.id }
    });
    console.log(`Fee Structures Found: ${structures.length}`);
  } else {
    console.log("Asogi Route not found");
  }
}

checkRouteDetails()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
