import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import FeeModals from './FeeModals';
import DeleteStructureButton from './DeleteStructureButton';
import EditStructureModal from './EditStructureModal';
import EditFeeHeadModal from './EditFeeHeadModal';
import DeleteFeeHeadButton from './DeleteFeeHeadButton';
import '@/app/school/[tenantId]/students/admission/admission.css';

export default async function FeesPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  
  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) || 
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();
  
  const tid = tenant?.id || 'demo';

  // Fetch Fee Structures
  const structures = await prisma.feeStructure.findMany({
    where: { tenantId: tid },
    include: { feeHead: true, session: true, class: true },
    orderBy: { amount: 'desc' }
  });

  const heads = await prisma.feeHead.findMany({ where: { tenantId: tid } });
  const sessions = await prisma.academicSession.findMany({ where: { tenantId: tid } });
  const classes = await prisma.class.findMany({ where: { tenantId: tid }, orderBy: { order: 'asc' } });

  return (
    <div className="admission-wizard" style={{ padding: '2rem' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="page-title">
          <span className="material-symbols-rounded" style={{ color: 'var(--teal)', fontSize: '24px' }}>settings_suggest</span>
          Fees Configuration
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
          <a href={`/school/${tenantId}/fees/groups`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600', fontSize: '13px' }}>
            <i className="ti ti-users-group"></i> Manage Groups
          </a>
          <FeeModals tenantId={tid} feeHeads={heads} sessions={sessions} classes={classes} />
        </div>
      </div>

      <div className="form-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="section-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-100)', marginBottom: 0 }}>
          <span className="material-symbols-rounded" style={{ color: 'var(--teal)', fontSize: '18px' }}>list_alt</span>
          <span className="section-title">Fee Structures</span>
        </div>
        
        {structures.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--gray-400)' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block', opacity: 0.5 }}>receipt_long</span>
            <p style={{ fontWeight: '600' }}>No fee structures defined.</p>
            <p style={{ fontSize: '13px' }}>Configure fee heads and assign them to classes/sessions to begin.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', textTransform: 'uppercase' }}>Fee Head</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', textTransform: 'uppercase' }}>Target Class</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', textTransform: 'uppercase' }}>Session</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', textTransform: 'uppercase' }}>Frequency</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {structures.map(fee => (
                  <tr key={fee.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontWeight: '700', color: 'var(--gray-800)', fontSize: '14px' }}>{fee.feeHead.name}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ backgroundColor: 'var(--gray-100)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: 'var(--gray-700)' }}>
                        {fee.class?.name || 'ALL CLASSES'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--gray-500)', fontSize: '13px' }}>{fee.session.name}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ fontWeight: '800', color: 'var(--teal)', fontSize: '15px' }}>₹{fee.amount.toLocaleString()}</span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ color: 'var(--orange)', fontWeight: '700', fontSize: '12px' }}>{fee.frequency}</span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <EditStructureModal tenantId={tid} structure={fee} feeHeads={heads} classes={classes} />
                        <DeleteStructureButton tenantId={tid} structureId={fee.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: '3rem' }}>
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <span className="material-symbols-rounded" style={{ color: 'var(--teal)', fontSize: '18px' }}>category</span>
          <span className="section-title">Fee Heads Master</span>
        </div>
        
        <div className="form-card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', textTransform: 'uppercase' }}>Name</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', textTransform: 'uppercase' }}>Description</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {heads.map(head => (
                <tr key={head.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '700', color: 'var(--gray-800)', fontSize: '14px' }}>{head.name}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--gray-500)', fontSize: '13px' }}>{head.description || '-'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {head.isRefundable ? (
                      <span className="auto-badge" style={{ color: 'var(--teal)', background: 'var(--teal-bg)' }}>REFUNDABLE</span>
                    ) : (
                      <span className="auto-badge" style={{ color: 'var(--gray-500)', background: 'var(--gray-50)' }}>NON-REFUNDABLE</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <EditFeeHeadModal tenantId={tid} head={head} />
                      <DeleteFeeHeadButton tenantId={tid} headId={head.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
