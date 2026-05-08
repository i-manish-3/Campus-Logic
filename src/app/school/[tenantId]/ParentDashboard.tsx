import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function ParentDashboard({ 
  userId, 
  tenantId, 
  schoolName 
}: { 
  userId: string, 
  tenantId: string, 
  schoolName: string 
}) {
  const parentProfile = await prisma.parentProfile.findUnique({
    where: { userId },
    include: {
      students: {
        include: {
          user: true,
          enrollments: {
            include: {
              class: true
            }
          },
          fees: {
            where: { status: { not: 'PAID' } }
          }
        }
      }
    }
  });

  if (!parentProfile) {
    return <div>No parent profile found for this user.</div>;
  }

  return (
    <main style={{ flex: 1, padding: '2rem', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Parent Portal</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Welcome back! Manage your children's school activities here.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {parentProfile.students.map((student) => {
          const pendingFees = student.fees.reduce((acc, fee) => acc + (fee.amountDue - fee.amountPaid - (fee.discount || 0)), 0);
          
          return (
            <div key={student.id} style={{ backgroundColor: 'white', borderRadius: '24px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '20px', backgroundColor: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: '800' }}>
                  {student.user.firstName[0]}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>{student.user.firstName} {student.user.lastName}</h2>
                  <p style={{ margin: '0.25rem 0', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>
                    Class: {student.enrollments[0]?.class.name || 'N/A'}
                  </p>
                  <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#0d9488', fontWeight: '700' }}>
                    ID: {student.admissionNumber}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', borderRadius: '16px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Attendance</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>92%</div>
                </div>
                <div style={{ padding: '1rem', borderRadius: '16px', backgroundColor: pendingFees > 0 ? '#fff1f2' : '#f0fdf4', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.7rem', color: pendingFees > 0 ? '#f43f5e' : '#16a34a', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Pending Fees</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: pendingFees > 0 ? '#e11d48' : '#15803d' }}>₹{pendingFees.toLocaleString()}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link 
                  href={`/school/${tenantId}/students/${student.id}`}
                  style={{ flex: 1, textAlign: 'center', padding: '0.75rem', backgroundColor: '#0d9488', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem' }}
                >
                  View Profile
                </Link>
                <Link 
                  href={`/school/${tenantId}/students/${student.id}?tab=Fees`}
                  style={{ flex: 1, textAlign: 'center', padding: '0.75rem', border: '1px solid #e2e8f0', color: '#475569', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem' }}
                >
                  Pay Fees
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
