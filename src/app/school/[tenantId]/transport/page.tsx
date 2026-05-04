import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import TransportModals from './TransportModals';
import DeleteRouteButton from './DeleteRouteButton';

export default async function TransportPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  
  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) || 
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();
  
  const actualTenantId = tenant ? tenant.id : 'mock-tenant-id';

  const routes = tenant ? await prisma.transportRoute.findMany({
    where: { tenantId: actualTenantId },
    include: { _count: { select: { students: true } } },
    orderBy: { name: 'asc' }
  }) : [];

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
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Transport Management</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Manage school bus routes, drivers, and monthly transportation fees.</p>
        </div>
        <TransportModals tenantId={actualTenantId} />
      </header>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '20px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
        overflow: 'hidden',
        border: '1px solid #f1f5f9'
      }}>
        {routes.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '4rem', marginBottom: '1rem', display: 'block' }}>directions_bus</span>
            <p style={{ fontSize: '1.1rem' }}>No transport routes configured.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Create routes and set fees to begin student allocation.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Route Name</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vehicle & Driver</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fee (Monthly)</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Allocated Students</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map(route => (
                <tr key={route.id} className="hover-row" style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ backgroundColor: '#fff7ed', padding: '0.4rem', borderRadius: '8px', color: '#f97316' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>route</span>
                      </div>
                      <span style={{ fontWeight: '700', color: '#1e293b' }}>{route.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: '600' }}>{route.vehicleNumber || 'No Vehicle'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{route.driverName || 'No Driver'} {route.driverPhone ? `(${route.driverPhone})` : ''}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>₹{route.feeAmount.toLocaleString()}</span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', backgroundColor: '#f0f9ff', color: '#0369a1', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>group</span>
                      {route._count.students} Students
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <DeleteRouteButton tenantId={actualTenantId} routeId={route.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
