import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function TenantDashboard({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  
  // First attempt to find by domain, then by ID
  let tenant = await prisma.tenant.findUnique({
    where: { domain: tenantId }
  });

  if (!tenant) {
    tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });
  }

  if (!tenant && tenantId !== 'demo-school') {
    notFound();
  }

  // Mock a tenant for demonstration if DB is empty and URL is /school/demo-school
  const schoolName = tenant?.name || 'Demo International School';
  const isActive = tenant ? tenant.isActive : true;

  // Fetch real-time dashboard metrics
  const [studentsCount, teachersCount, feeStats, examsCount] = await Promise.all([
    prisma.studentProfile.count({
      where: { tenantId: tenant?.id || 'demo', isActive: true }
    }),
    prisma.user.count({
      where: { 
        tenantId: tenant?.id || 'demo', 
        isActive: true,
        role: { name: { contains: 'Teacher' } }
      }
    }),
    prisma.studentFee.aggregate({
      where: { tenantId: tenant?.id || 'demo' },
      _sum: {
        amountDue: true,
        amountPaid: true,
        discount: true
      }
    }),
    prisma.exam.count({
      where: { 
        tenantId: tenant?.id || 'demo',
        startDate: { gte: new Date() }
      }
    })
  ]);

  const totalDue = feeStats._sum.amountDue ?? 0;
  const totalPaid = feeStats._sum.amountPaid ?? 0;
  const totalDiscount = feeStats._sum.discount ?? 0;
  const pendingFees = totalDue - totalPaid - totalDiscount;

  const metrics = [
    { label: 'Total Students', value: studentsCount.toLocaleString(), icon: 'group', color: '#3b82f6', trend: 'Active enrollments' },
    { label: 'Active Teachers', value: teachersCount.toLocaleString(), icon: 'person', color: '#8b5cf6', trend: 'Staff members' },
    { label: 'Pending Fees', value: `₹${Math.max(0, pendingFees).toLocaleString('en-IN')}`, icon: 'payments', color: '#f59e0b', trend: 'Needs attention' },
    { label: 'Upcoming Exams', value: examsCount.toString(), icon: 'description', color: '#10b981', trend: 'Scheduled ahead' }
  ];

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
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Dashboard Overview</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Welcome back! Here's what's happening in your school today.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '0.6rem 1.25rem', 
            borderRadius: '12px', 
            fontSize: '0.875rem', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: '1.2rem', color: isActive ? '#10b981' : '#ef4444' }}>
              {isActive ? 'check_circle' : 'error'}
            </span>
            <span style={{ fontWeight: '600', color: '#334155' }}>
              System Status: {isActive ? <span style={{color: '#059669'}}>Active</span> : <span style={{color: '#dc2626'}}>Suspended</span>}
            </span>
          </div>
        </div>
      </header>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {metrics.map((metric, i) => (
          <div key={metric.label} style={{ 
            backgroundColor: 'white', 
            padding: '1.75rem', 
            borderRadius: '16px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f1f5f9',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              right: 0, 
              width: '4px', 
              height: '100%', 
              backgroundColor: metric.color 
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ 
                backgroundColor: `${metric.color}15`, 
                padding: '0.75rem', 
                borderRadius: '12px',
                color: metric.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span className="material-symbols-rounded">{metric.icon}</span>
              </div>
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em' }}>{metric.label}</h3>
            <p style={{ margin: 0, fontSize: '1.875rem', fontWeight: '800', color: '#0f172a' }}>
              {metric.value}
            </p>
            <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>trending_up</span>
              {metric.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Placeholder for dynamic widgets */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2.5rem', 
        borderRadius: '20px', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #f1f5f9',
        background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '0.5rem', borderRadius: '8px', color: '#3b82f6' }}>
            <span className="material-symbols-rounded">auto_awesome</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', fontWeight: '700' }}>Quick Actions</h2>
        </div>
        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', maxWidth: '600px' }}>
          This area is your command center. You can configure custom widgets, view recent student admissions, or check the daily fee collection status at a glance.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button style={{ 
            backgroundColor: '#0f172a', 
            color: 'white', 
            border: 'none', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '10px', 
            fontWeight: '600', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>add</span>
            Add Widget
          </button>
          <button style={{ 
            backgroundColor: 'white', 
            color: '#475569', 
            border: '1px solid #e2e8f0', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '10px', 
            fontWeight: '600', 
            cursor: 'pointer'
          }}>
            Customize Layout
          </button>
        </div>
      </div>
    </main>
  );
}
