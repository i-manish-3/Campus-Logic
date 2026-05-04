import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import SchoolSettingsClient from './SettingsClient';

export default async function SettingsPage({
  params
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) || 
                 await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant) notFound();

  return (
    <main style={{ padding: '2.5rem', flex: 1 }}>
      <SchoolSettingsClient tenantId={tenantId} tenant={tenant} />
    </main>
  );
}
