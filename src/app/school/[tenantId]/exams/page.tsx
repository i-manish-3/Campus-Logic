import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ExamsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  
  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) || 
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();
  
  const actualTenantId = tenant ? tenant.id : 'mock-tenant-id';

  const exams = tenant ? await prisma.exam.findMany({
    where: { tenantId: actualTenantId },
    include: { examType: true, session: true },
    orderBy: { startDate: 'desc' }
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
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Exam Configuration</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Manage terms, exam types, and assessment schedules.</p>
        </div>
        <button style={{ 
          backgroundColor: '#059669', 
          color: 'white', 
          border: 'none', 
          padding: '0.75rem 1.5rem', 
          borderRadius: '12px', 
          cursor: 'pointer', 
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: '1.25rem' }}>add</span>
          Create Exam
        </button>
      </header>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '20px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
        overflow: 'hidden',
        border: '1px solid #f1f5f9'
      }}>
        {exams.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '4rem', marginBottom: '1rem', display: 'block' }}>history_edu</span>
            <p style={{ fontSize: '1.1rem' }}>No exams scheduled yet.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Create your first term exam or unit test to get started.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exam Name</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Session</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Schedule</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map(exam => (
                <tr key={exam.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ backgroundColor: '#f0fdf4', padding: '0.4rem', borderRadius: '8px', color: '#059669' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>description</span>
                      </div>
                      <span style={{ fontWeight: '700', color: '#1e293b' }}>{exam.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>
                      {exam.examType.name}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>{exam.session.name}</td>
                  <td style={{ padding: '1.25rem 1.5rem', color: '#334155', fontWeight: '500', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '1rem', color: '#94a3b8' }}>calendar_today</span>
                      {exam.startDate ? new Date(exam.startDate).toLocaleDateString() : 'N/A'} 
                      <span style={{ color: '#e2e8f0' }}>—</span>
                      {exam.endDate ? new Date(exam.endDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <button style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <span className="material-symbols-rounded">more_vert</span>
                    </button>
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
