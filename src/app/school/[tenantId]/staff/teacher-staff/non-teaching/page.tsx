import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function NonTeachingStaffPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;

  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) ||
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();

  const actualTenantId = tenant ? tenant.id : 'mock-tenant-id';

  // Get Teacher role to exclude
  const teacherRole = await prisma.role.findFirst({
    where: { name: 'Teacher' }
  });

  const nonTeachingStaff = tenant ? await prisma.user.findMany({
    where: {
      tenantId: actualTenantId,
      roleId: teacherRole?.id ? { not: teacherRole.id } : undefined,
      studentProfile: null
    },
    include: { role: true },
    orderBy: { firstName: 'asc' }
  }) : [];

  return (
    <main style={{ flex: 1, padding: '1.5rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Non-Teaching Staff</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>View all administrative and support staff</p>
      </header>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>Staff List</h2>
          <span style={{
            backgroundColor: '#fef3c7',
            color: '#b45309',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {nonTeachingStaff.length} Staff
          </span>
        </div>

        {nonTeachingStaff.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '3rem', marginBottom: '0.5rem', display: 'block' }}>badge</span>
            <p>No non-teaching staff found</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>S.No.</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {nonTeachingStaff.map((staff, index) => (
                <tr key={staff.id} style={{ borderBottom: index < nonTeachingStaff.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748b' }}>{index + 1}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '1.1rem', color: '#d97706' }}>person</span>
                      </div>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>
                        {staff.firstName}{staff.lastName ? ' ' + staff.lastName : ''}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748b' }}>{staff.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      backgroundColor: '#fef3c7',
                      color: '#b45309',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {staff.role?.name || 'Staff'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      backgroundColor: staff.isActive ? '#dcfce7' : '#fef2f2',
                      color: staff.isActive ? '#15803d' : '#dc2626',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {staff.isActive ? 'Active' : 'Inactive'}
                    </span>
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