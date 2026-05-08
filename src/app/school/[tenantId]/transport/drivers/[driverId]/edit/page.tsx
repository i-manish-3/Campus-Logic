import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditDriverForm from './EditDriverForm';

export default async function EditDriverPage({ 
  params 
}: { 
  params: Promise<{ tenantId: string; driverId: string }> 
}) {
  const { tenantId, driverId } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) || 
                 await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();
  const actualTenantId = tenant ? tenant.id : 'mock-tenant-id';

  const driver = await prisma.transportDriver.findUnique({
    where: { id: driverId, tenantId: actualTenantId },
    include: { user: true }
  });

  if (!driver) notFound();

  return (
    <EditDriverForm 
      tenantId={tenantId} 
      driver={JSON.parse(JSON.stringify(driver))} 
    />
  );
}
