import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function ClassListPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;

  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) ||
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();

  const actualTenantId = tenant ? tenant.id : 'mock-tenant-id';

  // Fetch all classes with sections and subjects
  const classes = tenant ? await prisma.class.findMany({
    where: { tenantId: actualTenantId },
    include: {
      sections: true,
      classSubjects: {
        include: { subject: true }
      }
    },
    orderBy: { order: 'asc' }
  }) : [];

  return (
    <main style={{ flex: 1, padding: '1.5rem' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Class List</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>View all classes with their sections and subjects</p>
        </div>
      </header>

      {classes.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center',
          color: '#94a3b8',
          border: '1px solid #e2e8f0'
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>domain_disabled</span>
          <p>No classes found</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {classes.map((cls) => (
            <div key={cls.id} style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: '#f0f9ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0ea5e9'
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '1.25rem' }}>layers</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem' }}>{cls.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Order: {cls.order}</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Sections ({cls.sections.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {cls.sections.length > 0 ? cls.sections.map(sec => (
                    <span key={sec.id} style={{ fontSize: '0.8rem', color: '#475569', backgroundColor: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      {sec.name}
                    </span>
                  )) : <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No sections</span>}
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Subjects ({cls.classSubjects.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {cls.classSubjects.length > 0 ? cls.classSubjects.map(cs => (
                    <span key={cs.id} style={{ fontSize: '0.7rem', color: '#64748b', backgroundColor: 'white', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      {cs.subject.name}
                    </span>
                  )) : <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No subjects</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}