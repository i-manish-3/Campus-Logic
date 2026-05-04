import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function SubjectsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  
  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) || 
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();
  
  const actualTenantId = tenant ? tenant.id : 'mock-tenant-id';

  const subjects = tenant ? await prisma.subject.findMany({
    where: { tenantId: actualTenantId },
    include: { classSubjects: { include: { class: true } } },
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
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Subject Management</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Configure academic subjects, codes, and class assignments.</p>
        </div>
        <button style={{ 
          backgroundColor: '#0f172a', 
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
          Create Subject
        </button>
      </header>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '20px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
        overflow: 'hidden',
        border: '1px solid #f1f5f9'
      }}>
        {subjects.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '4rem', marginBottom: '1rem', display: 'block' }}>book_off</span>
            <p style={{ fontSize: '1.1rem' }}>No subjects configured yet.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Add Theory and Practical subjects to build your curriculum.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Code</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Classes</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(subject => (
                <tr key={subject.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ backgroundColor: '#eff6ff', padding: '0.4rem', borderRadius: '8px', color: '#3b82f6' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>menu_book</span>
                      </div>
                      <span style={{ fontWeight: '700', color: '#1e293b' }}>{subject.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>
                      {subject.code || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ 
                      backgroundColor: subject.type === 'THEORY' ? '#ecfeff' : '#fdf2f8', 
                      color: subject.type === 'THEORY' ? '#0891b2' : '#db2777', 
                      padding: '0.3rem 0.75rem', 
                      borderRadius: '8px', 
                      fontSize: '0.75rem', 
                      fontWeight: '800' 
                    }}>
                      {subject.type}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {subject.classSubjects.length > 0 ? subject.classSubjects.map(cs => (
                        <span key={cs.id} style={{ fontSize: '0.8rem', color: '#64748b', backgroundColor: '#f8fafc', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          {cs.class.name}
                        </span>
                      )) : <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>None</span>}
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
