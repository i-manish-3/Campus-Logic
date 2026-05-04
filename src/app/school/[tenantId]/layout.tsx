import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default async function SchoolLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;

  let tenant = await prisma.tenant.findUnique({
    where: { domain: tenantId }
  }) || await prisma.tenant.findUnique({
    where: { id: tenantId }
  });

  if (!tenant && tenantId !== 'demo-school') {
    notFound();
  }

  const schoolName = tenant?.name || 'Demo International School';
  const logoUrl = tenant?.logoUrl || null;
  const actualTenantId = tenant ? tenant.id : 'demo-school';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
      <Sidebar tenantId={tenantId} schoolName={schoolName} logoUrl={logoUrl} />
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}
