import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import MasterFeeGrid from './MasterFeeGrid';

export default async function MasterFeeSetupPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  
  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) || 
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();
  
  const tid = tenant?.id || 'demo';

  // Fetch all necessary data for the grid
  const [heads, groups, classes, sessions] = await Promise.all([
    prisma.feeHead.findMany({ where: { tenantId: tid } }),
    prisma.feeGroup.findMany({ 
      where: { tenantId: tid },
      include: {
        structures: {
          include: {
            installments: true,
            feeHead: true
          }
        }
      }
    }),
    prisma.class.findMany({ where: { tenantId: tid }, orderBy: { order: 'asc' } }),
    prisma.academicSession.findMany({ where: { tenantId: tid }, orderBy: { startDate: 'desc' } })
  ]);

  const currentSession = sessions.find(s => s.isCurrent) || sessions[0];

  return (
    <div style={{ padding: '2rem' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '14px', 
            background: 'var(--teal-bg)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <span className="material-symbols-rounded" style={{ color: 'var(--teal)', fontSize: '28px' }}>
              calendar_view_month
            </span>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>Master Fee Setup</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Configure monthly fee structures for classes and groups</p>
          </div>
        </div>
      </div>

      <MasterFeeGrid 
        tenantId={tid}
        heads={heads}
        groups={groups}
        classes={classes}
        currentSessionId={currentSession?.id}
      />
    </div>
  );
}
