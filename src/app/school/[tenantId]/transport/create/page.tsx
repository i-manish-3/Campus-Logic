import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import TransportForm from './TransportForm';

export default async function CreateTransportPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  
  const tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) || 
                 await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();
  
  const actualTenantId = tenant ? tenant.id : 'mock-tenant-id';

  // Fetch all sessions for the dropdown
  const sessions = tenant ? await prisma.academicSession.findMany({
    where: { tenantId: actualTenantId },
    orderBy: { startDate: 'desc' }
  }) : [];

  // Fetch all drivers for the dropdown
  const drivers = tenant ? await prisma.transportDriver.findMany({
    where: { tenantId: actualTenantId },
    orderBy: { name: 'asc' }
  }) : [];

  return (
    <TransportForm 
      tenantId={actualTenantId} 
      sessions={sessions.map(s => ({ 
        id: s.id, 
        name: s.name, 
        isCurrent: s.isCurrent 
      }))} 
      drivers={drivers.map(d => ({
        id: d.id,
        name: d.name,
        photoUrl: d.photoUrl
      }))}
    />
  );
}
