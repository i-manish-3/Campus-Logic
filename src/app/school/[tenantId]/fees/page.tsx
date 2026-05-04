import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FeeModals from './FeeModals';
import DeleteStructureButton from './DeleteStructureButton';
import EditStructureModal from './EditStructureModal';
import EditFeeHeadModal from './EditFeeHeadModal';
import DeleteFeeHeadButton from './DeleteFeeHeadButton';

export default async function FeesPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  
  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) || 
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();
  
  const actualTenantId = tenant ? tenant.id : 'mock-tenant-id';

  // Fetch Fee Structures
  const structures = tenant ? await prisma.feeStructure.findMany({
    where: { tenantId: actualTenantId },
    include: { feeHead: true, session: true, class: true },
    orderBy: { amount: 'desc' }
  }) : [];

  const heads = tenant ? await prisma.feeHead.findMany({ where: { tenantId: actualTenantId } }) : [];
  const sessions = tenant ? await prisma.academicSession.findMany({ where: { tenantId: actualTenantId } }) : [];
  const classes = tenant ? await prisma.class.findMany({ where: { tenantId: actualTenantId }, orderBy: { order: 'asc' } }) : [];

  return (
    <main style={{ flex: 1, padding: '2.5rem' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '3rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Fees Configuration</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Configure fee structures, installments, and academic billing cycles.</p>
        </div>
        <FeeModals tenantId={actualTenantId} feeHeads={heads} sessions={sessions} classes={classes} />
      </header>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '20px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
        overflow: 'hidden',
        border: '1px solid #f1f5f9'
      }}>
        {structures.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '4rem', marginBottom: '1rem', display: 'block' }}>payments</span>
            <p style={{ fontSize: '1.1rem' }}>No fee structures defined.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Configure fee heads and assign them to classes/sessions to begin.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fee Head</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Session</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Frequency</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {structures.map(fee => (
                <tr key={fee.id} className="hover-row" style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ backgroundColor: '#f0f9ff', padding: '0.4rem', borderRadius: '6px', color: '#0ea5e9' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>account_balance</span>
                      </div>
                      <span style={{ fontWeight: '700', color: '#1e293b' }}>{fee.feeHead.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>
                      {fee.class?.name || 'ALL CLASSES'}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>{fee.session.name}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>₹{fee.amount.toLocaleString()}</span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      backgroundColor: '#f5f3ff',
                      color: '#7c3aed',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>sync</span>
                      {fee.frequency}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <EditStructureModal tenantId={actualTenantId} structure={fee} feeHeads={heads} classes={classes} />
                      <DeleteStructureButton tenantId={actualTenantId} structureId={fee.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: '4rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem' }}>Fee Categories (Heads)</h2>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '20px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
          overflow: 'hidden',
          border: '1px solid #f1f5f9'
        }}>
          {heads.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <p>No fee categories defined.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase' }}>Category Name</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase' }}>Description</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase' }}>Refundable</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {heads.map(head => (
                  <tr key={head.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '700', color: '#1e293b' }}>{head.name}</td>
                    <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>{head.description || '-'}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {head.isRefundable ? (
                        <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>check_circle</span> Yes
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <EditFeeHeadModal tenantId={actualTenantId} head={head} />
                        <DeleteFeeHeadButton tenantId={actualTenantId} headId={head.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
