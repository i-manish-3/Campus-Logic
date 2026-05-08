const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  const tenants = await prisma.tenant.findMany();
  
  for (const tenant of tenants) {
    const slug = tenant.domain;
    const uuid = tenant.id;
    
    if (!slug || slug === uuid) continue;

    console.log(`Migrating tenant ${slug} -> ${uuid}`);

    // List of models with tenantId
    const models = [
      'user', 'role', 'academicSession', 'class', 'section', 
      'feeHead', 'feeStructure', 'feeInstallment', 'studentProfile', 
      'parentProfile', 'studentEnrollment', 'studentFee', 'feePayment',
      'transportDriver', 'transportRoute'
    ];

    for (const model of models) {
      try {
        const count = await prisma[model].updateMany({
          where: { tenantId: slug },
          data: { tenantId: uuid }
        });
        if (count.count > 0) {
          console.log(`- Updated ${count.count} records in ${model}`);
        }
      } catch (e) {
        // Some models might not have tenantId or might fail
      }
    }
  }
}

migrate();
