import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import EditStudentModal from './EditStudentModal';
import ToggleStatusButton from './ToggleStatusButton';
import StudentFilters from './StudentFilters';

export default async function StudentsPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ tenantId: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { tenantId } = await params;
  const { q, classId, sectionId, status, sessionId } = await searchParams;

  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) ||
    await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();

  const actualTenantId = tenant ? tenant.id : 'mock-tenant-id';

  const students = tenant ? await prisma.studentProfile.findMany({
    where: { 
      tenantId: actualTenantId,
      ...(status === 'active' && { isActive: true }),
      ...(status === 'inactive' && { isActive: false }),
      ...((classId || sectionId || sessionId) && {
        enrollments: {
          some: {
            ...(classId && { classId: classId as string }),
            ...(sectionId && { sectionId: sectionId as string }),
            ...(sessionId && { sessionId: sessionId as string }),
          }
        }
      }),
      ...(q && {
        OR: [
          { user: { firstName: { contains: q as string } } },
          { user: { lastName: { contains: q as string } } },
          { admissionNumber: { contains: q as string } },
          { registrationNumber: { contains: q as string } },
        ]
      })
    },
    include: {
      user: true,
      enrollments: { include: { class: true, section: true } },
      fees: true
    },
    orderBy: { admissionNumber: 'asc' }
  }) : [];

  const sessions = tenant ? await prisma.academicSession.findMany({ where: { tenantId: actualTenantId }, orderBy: { startDate: 'desc' } }) : [];
  const classes = tenant ? await prisma.class.findMany({ where: { tenantId: actualTenantId }, orderBy: { order: 'asc' } }) : [];
  const sections = tenant ? await prisma.section.findMany({ where: { tenantId: actualTenantId } }) : [];
  const routes = tenant ? await prisma.transportRoute.findMany({ where: { tenantId: actualTenantId } }) : [];

  return (
    <main style={{ flex: 1, padding: '1.5rem 2.5rem', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1rem 0',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <i className="ti ti-users" style={{ color: '#0d9488', fontSize: '1.4rem' }}></i>
            Student Directory
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>Manage student records and academic status.</p>
        </div>
        <Link
          href={`/school/${tenantId}/students/admission`}
          style={{
            backgroundColor: '#0d9488',
            color: 'white',
            border: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)',
            transition: 'transform 0.1s'
          }}
        >
          <i className="ti ti-user-plus" style={{ fontSize: '1.1rem' }}></i>
          Admit Student
        </Link>
      </header>

      <StudentFilters 
        classes={classes.map(c => ({ id: c.id, name: c.name }))}
        sections={sections.map(s => ({ id: s.id, name: s.name, classId: s.classId }))}
        sessions={sessions.map(s => ({ id: s.id, name: s.name }))}
      />

      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        maxWidth: '1200px'
      }}>
        {students.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', backgroundColor: '#f0fdfa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <i className="ti ti-user-off" style={{ fontSize: '1.8rem', color: '#0d9488' }}></i>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>No students admitted yet</h3>
            <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.85rem' }}>Start by admitting your first student.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID / Admission</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => {
                  const balance = student.fees.reduce((s, f) => s + (f.amountDue - f.amountPaid), 0);
                  const initials = `${student.user.firstName?.[0] || ''}${student.user.lastName?.[0] || ''}`;

                  return (
                    <tr key={student.id} style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.2s',
                      opacity: student.isActive ? 1 : 0.7
                    }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: student.isActive ? '#f0fdfa' : '#f1f5f9',
                            color: student.isActive ? '#0d9488' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '0.75rem',
                            border: `1px solid ${student.isActive ? '#ccfbf1' : '#e2e8f0'}`
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: student.isActive ? '#1e293b' : '#64748b', fontSize: '0.85rem' }}>
                              {student.user.firstName} {student.user.lastName}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                              {student.user.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ color: '#0d9488', fontWeight: '700', fontSize: '0.8rem' }}>#{student.admissionNumber}</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>{student.registrationNumber}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {student.enrollments[0] ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontWeight: '600', color: '#334155', fontSize: '0.8rem' }}>{student.enrollments[0].class.name}</span>
                            <span style={{ color: '#0d9488', fontWeight: '800', fontSize: '0.8rem' }}>{student.enrollments[0].section?.name}</span>
                          </div>
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>N/A</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.65rem',
                          fontWeight: '800',
                          backgroundColor: balance > 0 ? '#fff1f2' : '#f0fdf4',
                          color: balance > 0 ? '#be123c' : '#15803d',
                          border: `1px solid ${balance > 0 ? '#fecdd3' : '#bbf7d0'}`
                        }}>
                          {balance > 0 ? `₹${balance}` : 'Paid'}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <Link 
                            href={`/school/${tenantId}/students/${student.id}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              backgroundColor: '#f8fafc',
                              color: '#0d9488',
                              border: '1px solid #e2e8f0',
                              textDecoration: 'none'
                            }}
                            title="View"
                          >
                            <i className="ti ti-eye" style={{ fontSize: '1rem' }}></i>
                          </Link>
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
          </div>
        )}
      </div>
    </main>
  );
}
