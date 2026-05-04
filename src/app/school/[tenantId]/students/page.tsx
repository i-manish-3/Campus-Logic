import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StudentModals from './StudentModals';
import EditStudentModal from './EditStudentModal';
import ToggleStatusButton from './ToggleStatusButton';

export default async function StudentsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;

  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) ||
    await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();

  const actualTenantId = tenant ? tenant.id : 'mock-tenant-id';

  const students = tenant ? await prisma.studentProfile.findMany({
    where: { tenantId: actualTenantId },
    include: {
      user: true,
      enrollments: { include: { class: true, section: true } },
      fees: true
    },
    orderBy: { admissionNumber: 'asc' }
  }) : [];

  const sessions = tenant ? await prisma.academicSession.findMany({ where: { tenantId: actualTenantId } }) : [];
  const classes = tenant ? await prisma.class.findMany({ where: { tenantId: actualTenantId }, orderBy: { order: 'asc' } }) : [];
  const sections = tenant ? await prisma.section.findMany({ where: { tenantId: actualTenantId } }) : [];
  const routes = tenant ? await prisma.transportRoute.findMany({ where: { tenantId: actualTenantId } }) : [];

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
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Student Directory</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Manage student records, enrollments, and financial status.</p>
        </div>
        <StudentModals
          tenantId={actualTenantId}
          sessions={sessions}
          classes={classes}
          sections={sections}
          transportRoutes={routes}
        />
      </header>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        border: '1px solid #f1f5f9'
      }}>
        {students.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '4rem', marginBottom: '1rem', display: 'block' }}>person_off</span>
            <p style={{ fontSize: '1.1rem' }}>No students admitted yet.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Start by clicking the "Admit Student" button above.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admission No</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class/Section</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Financial Status</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const balance = student.fees.reduce((s, f) => s + (f.amountDue - f.amountPaid), 0);
                const firstNameInitial = student.user.firstName ? student.user.firstName[0] : '?';
                const lastNameInitial = student.user.lastName ? student.user.lastName[0] : '';

                return (
                  <tr key={student.id} style={{
                    borderBottom: '1px solid #f1f5f9',
                    opacity: student.isActive ? 1 : 0.6,
                    backgroundColor: student.isActive ? 'transparent' : '#f8fafc'
                  }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          backgroundColor: student.isActive ? '#eef2ff' : '#f1f5f9',
                          color: student.isActive ? '#4f46e5' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700'
                        }}>
                          {firstNameInitial}{lastNameInitial}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: student.isActive ? '#1e293b' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {student.user.firstName} {student.user.lastName}
                            {!student.isActive && (
                              <span style={{ fontSize: '0.65rem', backgroundColor: '#94a3b8', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase' }}>Disabled</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{student.user.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: '#334155', fontWeight: '600' }}>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                        {student.admissionNumber}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {student.enrollments[0] ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: '600', color: '#1e293b' }}>{student.enrollments[0].class.name}</span>
                          <span style={{ color: '#94a3b8' }}>•</span>
                          <span style={{ color: '#64748b' }}>{student.enrollments[0].section?.name || 'A'}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>Not Enrolled</span>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: balance > 0 ? '#fef2f2' : '#f0fdf4',
                        color: balance > 0 ? '#dc2626' : '#16a34a',
                        border: balance > 0 ? '1px solid #fee2e2' : '1px solid #dcfce7'
                      }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>{balance > 0 ? 'account_balance_wallet' : 'check_circle'}</span>
                        {balance > 0 ? `₹${balance.toLocaleString()} Due` : 'Fully Paid'}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>

                        <EditStudentModal
                          tenantId={actualTenantId}
                          student={student}
                          routes={routes.map(r => ({ id: r.id, name: r.name, feeAmount: r.feeAmount }))}
                        />
                        <ToggleStatusButton
                          tenantId={actualTenantId}
                          studentId={student.id}
                          isActive={student.isActive}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
