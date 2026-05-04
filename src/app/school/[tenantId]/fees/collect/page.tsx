import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import QuickCollectClient from './QuickCollectClient';

export default async function CollectFeesPage({
  params
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) || 
                 await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant) notFound();

  const classes = await prisma.class.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: 'asc' }
  });

  return (
    <main style={{ padding: '2.5rem', flex: 1 }}>
      <QuickCollectClient tenantId={tenantId} classes={classes} />
    </main>
  );
}
