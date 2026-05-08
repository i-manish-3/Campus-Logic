import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import FeeGroupManager from './FeeGroupManager';

export default async function FeeGroupsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  
  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) || 
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant) notFound();
  const tid = tenant.id;

  const groups = (prisma as any).feeGroup ? await (prisma as any).feeGroup.findMany({
    where: { tenantId: tid },
    include: {
      concessions: {
        include: {
          feeHead: true
        }
      },
      _count: {
        select: { students: true }
      }
    },
    orderBy: { name: 'asc' }
  }) : [];

  const heads = await prisma.feeHead.findMany({
    where: { tenantId: tid },
    orderBy: { name: 'asc' }
  });

  return (
    <div style={{ padding: '2rem' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="page-title">
          <span className="material-symbols-rounded" style={{ color: 'var(--teal)', fontSize: '24px' }}>groups</span>
          Fee Groups & Concessions
        </div>
      </div>

      <FeeGroupManager tenantId={tid} groups={groups} feeHeads={heads} />
    </div>
  );
}
