import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function TimetablePage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  
  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) || 
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();

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
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Timetable Builder</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Design and manage flexible academic schedules and teacher assignments.</p>
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
          Configure Periods
        </button>
      </header>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '24px', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
        border: '1px solid #f1f5f9', 
        padding: '5rem 2rem', 
        textAlign: 'center',
        background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)'
      }}>
        <div style={{ backgroundColor: '#f0f9ff', width: '80px', height: '80px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', margin: '0 auto 2rem auto' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '3rem' }}>calendar_month</span>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '1rem' }}>Drag & Drop Interface</h2>
        <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
          Our advanced timetable builder allows you to assign subjects and teachers to flexible time slots without hardcoding period counts. 
        </p>
        <div style={{ marginTop: '2.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fefce8', color: '#854d0e', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '700', border: '1px solid #fef08a' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>engineering</span>
          Feature Under Construction
        </div>
      </div>
    </main>
  );
}
