import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import SessionForm from '../SessionForm';

export default async function AddSessionPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;

  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) ||
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();

  const actualTenantId = tenant ? tenant.id : 'mock-tenant-id';

  const sessions = tenant ? await prisma.academicSession.findMany({
    where: { tenantId: actualTenantId },
    orderBy: { startDate: 'asc' }
  }) : [];

  // Transform dates to strings for client
  const serializedSessions = sessions.map(s => ({
    id: s.id,
    name: s.name,
    startDate: s.startDate.toISOString().split('T')[0],
    endDate: s.endDate.toISOString().split('T')[0],
    isCurrent: s.isCurrent,
  }));

  return <SessionForm sessions={serializedSessions} tenantId={actualTenantId} />;
}