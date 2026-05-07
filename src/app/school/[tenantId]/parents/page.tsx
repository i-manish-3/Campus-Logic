import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function ParentsPage({
  params
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { domain: tenantId },
    include: {
      parentProfiles: {
        include: {
          user: true,
          students: {
            include: {
              user: true,
              enrollments: {
                include: {
                  class: true
                }
              }
            }
          }
        }
      }
    }
  }) || await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      parentProfiles: {
        include: {
          user: true,
          students: {
            include: {
              user: true,
              enrollments: {
                include: {
                  class: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!tenant) {
    notFound();
  }

  const parents = tenant.parentProfiles;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Parent Directory</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.5rem' }}>View parent accounts and their linked children.</p>
      </header>

      <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1.25rem', color: '#475569', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Parent Name</th>
              <th style={{ padding: '1.25rem', color: '#475569', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Login ID (Email)</th>
              <th style={{ padding: '1.25rem', color: '#475569', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Children</th>
              <th style={{ padding: '1.25rem', color: '#475569', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parents.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                   No parent accounts found. Accounts are created during student admission.
                </td>
              </tr>
            ) : (
              parents.map((parent) => (
                <tr key={parent.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                    {parent.user.firstName} {parent.user.lastName}
                  </td>
                  <td style={{ padding: '1.25rem', color: '#64748b' }}>
                    {parent.user.email}
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {parent.students.map((student) => (
                        <span key={student.id} style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                          {student.user.firstName} ({student.enrollments[0]?.class.name || 'N/A'})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                    <button style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
