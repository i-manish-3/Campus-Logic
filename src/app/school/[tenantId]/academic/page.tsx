import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AcademicModals from './AcademicModals';

export default async function AcademicSetupPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  
  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) || 
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();
  
  const actualTenantId = tenant ? tenant.id : 'mock-tenant-id';

  // Fetch Academic Data
  const classes = tenant ? await prisma.class.findMany({
    where: { tenantId: actualTenantId },
    include: { sections: true },
    orderBy: { order: 'asc' }
  }) : [];

  const sessions = tenant ? await prisma.academicSession.findMany({
    where: { tenantId: actualTenantId },
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
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Academic Configuration</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Define your school's structure, classes, and academic cycles.</p>
        </div>
        <AcademicModals tenantId={actualTenantId} classes={classes} />
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }}>
        {/* Classes & Sections Configuration */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '20px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: '#f0f9ff', padding: '0.5rem', borderRadius: '8px', color: '#0ea5e9' }}>
              <span className="material-symbols-rounded">layers</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', fontWeight: '700' }}>Classes & Sections</h2>
          </div>
          
          {classes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>domain_disabled</span>
              <p>No classes defined. Add your first class to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {classes.map((cls) => (
                <div key={cls.id} style={{ 
                  border: '1px solid #f1f5f9', 
                  borderRadius: '12px', 
                  padding: '1.25rem',
                  backgroundColor: '#f8fafc',
                  transition: 'transform 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.1rem' }}>{cls.name}</span>
                      <span style={{ fontSize: '0.7rem', backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '6px', color: '#475569', fontWeight: '600' }}>RANK {cls.order}</span>
                    </div>
                    <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '1.25rem' }}>edit</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {cls.sections.map((sec) => (
                      <span key={sec.id} style={{ 
                        backgroundColor: 'white', 
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '8px', 
                        fontSize: '0.85rem', 
                        color: '#334155',
                        border: '1px solid #e2e8f0',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '0.9rem', color: '#94a3b8' }}>tag</span>
                        Section {sec.name}
                      </span>
                    ))}
                    {cls.sections.length === 0 && <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>No sections yet</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Academic Sessions */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '20px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: '#f5f3ff', padding: '0.5rem', borderRadius: '8px', color: '#8b5cf6' }}>
              <span className="material-symbols-rounded">event_repeat</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', fontWeight: '700' }}>Academic Sessions</h2>
          </div>
          
          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>calendar_today</span>
              <p>No sessions defined.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sessions.map((session) => (
                <div key={session.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1.25rem', 
                  backgroundColor: session.isCurrent ? '#f0fdf4' : '#f9fafb', 
                  borderRadius: '16px',
                  border: session.isCurrent ? '1px solid #bbf7d0' : '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ color: session.isCurrent ? '#166534' : '#64748b' }}>
                      <span className="material-symbols-rounded">calendar_month</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: '#1e293b' }}>{session.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                        {new Date(session.startDate).toLocaleDateString()} — {new Date(session.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {session.isCurrent && (
                    <span style={{ 
                      backgroundColor: '#166534', 
                      color: 'white', 
                      padding: '0.3rem 0.75rem', 
                      borderRadius: '8px', 
                      fontSize: '0.7rem', 
                      fontWeight: '700',
                      letterSpacing: '0.05em'
                    }}>
                      ACTIVE
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
