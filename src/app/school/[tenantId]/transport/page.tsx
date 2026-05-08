import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteRouteButton } from './RouteActions';
import "@/app/school/[tenantId]/students/admission/admission.css";

export default async function TransportPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  
  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) || 
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();
  
  const actualTenantId = tenant ? tenant.id : 'mock-tenant-id';

  const routes = tenant ? await prisma.transportRoute.findMany({
    where: { tenantId: actualTenantId },
    include: { 
      _count: { select: { students: true } },
      driver: true 
    },
    orderBy: { name: 'asc' }
  }) : [];

  return (
    <main style={{ flex: 1, padding: '1.5rem 2.5rem', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <header className="page-header">
        <div>
          <h1 className="page-title">
            <i className="ti ti-bus"></i>
            Transport Management
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>Manage school bus routes, drivers, and fees.</p>
        </div>
        <div className="header-actions">
          <Link
            href={`/school/${tenantId}/transport/drivers`}
            className="btn btn-outline"
          >
            <i className="ti ti-users"></i>
            Drivers
          </Link>
          <Link
            href={`/school/${tenantId}/transport/create`}
            className="btn btn-teal"
          >
            <i className="ti ti-plus"></i>
            Create Route
          </Link>
        </div>
      </header>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '16px', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', 
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        maxWidth: '1200px'
      }}>
        {routes.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', backgroundColor: '#f0fdfa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <i className="ti ti-map-pin-off" style={{ fontSize: '1.8rem', color: '#0d9488' }}></i>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>No routes configured</h3>
            <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.85rem' }}>Start by creating your first school bus route.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Route Name</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vehicle Details</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Driver Info</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Fee</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Students</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map(route => (
                  <tr key={route.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '8px', 
                          backgroundColor: '#f0fdfa', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: '#0d9488',
                          border: '1px solid #ccfbf1'
                        }}>
                          <i className="ti ti-map-pin" style={{ fontSize: '1rem' }}></i>
                        </div>
                        <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.85rem' }}>{route.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ 
                        backgroundColor: '#f1f5f9', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: '700', 
                        color: '#475569',
                        border: '1px solid #e2e8f0'
                      }}>
                        {route.vehicleNumber || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          overflow: 'hidden',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {route.driver?.photoUrl ? (
                            <img src={route.driver.photoUrl} alt={route.driver.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <i className="ti ti-user" style={{ fontSize: '0.9rem', color: '#64748b' }}></i>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>{route.driver?.name || 'Not Assigned'}</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{route.driver?.phone || ''}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontWeight: '800', color: '#0d9488', fontSize: '0.9rem' }}>₹{route.feeAmount.toLocaleString()}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.3rem', 
                        backgroundColor: '#f0fdfa', 
                        color: '#0d9488', 
                        padding: '0.25rem 0.6rem', 
                        borderRadius: '6px', 
                        fontSize: '0.7rem', 
                        fontWeight: '800',
                        border: '1px solid #ccfbf1'
                      }}>
                        <i className="ti ti-users" style={{ fontSize: '0.9rem' }}></i>
                        {route._count.students}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <Link 
                          href={`/school/${tenantId}/transport/${route.id}/edit`}
                          className="btn-icon"
                          title="Edit Route"
                        >
                          <i className="ti ti-edit" style={{ fontSize: '1.1rem' }}></i>
                        </Link>
                        <DeleteRouteButton tenantId={actualTenantId} routeId={route.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
