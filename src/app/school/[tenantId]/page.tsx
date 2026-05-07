import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function TenantDashboard({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  
  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) || 
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();

  const tid = tenant?.id || 'demo';
  const schoolName = tenant?.name || 'Yug International School';
  
  // Fetch Metrics & Real-time Data
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [studentsCount, teachersCount, feeStats, examsCount, recentPayments, allStudents] = await Promise.all([
    prisma.studentProfile.count({ where: { tenantId: tid, isActive: true } }),
    prisma.user.count({ 
      where: { 
        tenantId: tid, 
        isActive: true,
        role: { name: { contains: 'Teacher' } }
      } 
    }),
    prisma.studentFee.aggregate({
      where: { tenantId: tid },
      _sum: { amountDue: true, amountPaid: true, discount: true }
    }),
    prisma.exam.count({ 
      where: { tenantId: tid, startDate: { gte: now } } 
    }),
    prisma.feePayment.findMany({
      where: { tenantId: tid },
      orderBy: { paymentDate: 'desc' },
      take: 6,
      include: { studentFee: { include: { student: { include: { user: true } } } } }
    }),
    prisma.studentProfile.findMany({
      where: { tenantId: tid, isActive: true },
      include: { user: true, enrollments: { include: { class: true } } }
    })
  ]);

  // Filter Todays Birthdays
  const todaysBirthdays = allStudents.filter(s => {
    if (!s.dob) return false;
    const dob = new Date(s.dob);
    return dob.getMonth() === now.getMonth() && dob.getDate() === now.getDate();
  });

  const totalDue = feeStats._sum.amountDue ?? 0;
  const totalPaid = feeStats._sum.amountPaid ?? 0;
  const totalDiscount = feeStats._sum.discount ?? 0;
  const pendingFees = Math.max(0, totalDue - totalPaid - totalDiscount);

  // Time-based greeting
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const metrics = [
    { label: 'Total Students', value: studentsCount, icon: 'school', color: '#1e293b', sub: 'Active' },
    { label: 'Total Staff', value: teachersCount, icon: 'badge', color: '#14b8a6', sub: 'On Duty' },
    { label: 'Attendance', value: '94%', icon: 'calendar_month', color: '#f59e0b', sub: 'Today (Est.)' },
    { label: 'Collected', value: `₹${(totalPaid / 1000).toFixed(1)}k`, icon: 'payments', color: '#ec4899', sub: 'Live' },
    { label: 'Fees Due', value: `₹${(pendingFees / 1000).toFixed(1)}k`, icon: 'priority_high', color: '#991b1b', sub: 'Critical', badge: 'CRITICAL' },
    { label: 'Monthly Income', value: `₹${(totalPaid * 0.8 / 1000).toFixed(1)}k`, icon: 'trending_up', color: '#6366f1', sub: '+12.5%' },
  ];

  return (
    <main style={{ flex: 1, padding: '1.5rem', backgroundColor: '#fcfcfd', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>
            {greeting}
          </h1>
          <p style={{ margin: '0.15rem 0 0', color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '0.9rem' }}>domain</span>
            {schoolName} <span style={{ color: '#cbd5e1' }}>|</span> 
            <span className="material-symbols-rounded" style={{ fontSize: '0.9rem' }}>schedule</span>
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} <span style={{ color: '#cbd5e1' }}>|</span>
            {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ 
            backgroundColor: m.color, 
            padding: '1rem', 
            borderRadius: '16px', 
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.8 }}>{m.label}</span>
              <span className="material-symbols-rounded" style={{ fontSize: '1rem', opacity: 0.5 }}>{m.icon}</span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', marginBottom: '0.15rem' }}>{m.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
               <span style={{ fontSize: '0.65rem', fontWeight: '700', opacity: 0.9 }}>{m.sub}</span>
               {m.badge && <span style={{ backgroundColor: '#ffffff30', fontSize: '0.5rem', padding: '0.05rem 0.3rem', borderRadius: '4px', fontWeight: '900' }}>{m.badge}</span>}
            </div>
            <div style={{ position: 'absolute', right: '-8px', bottom: '-8px', fontSize: '3rem', opacity: 0.1 }} className="material-symbols-rounded">{m.icon}</div>
          </div>
        ))}
      </div>

      {/* Main Content Bento Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        
        {/* Live Activity Protocol (Real Data) */}
        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-rounded" style={{ color: '#ec4899', fontSize: '1.2rem' }}>sensors</span>
              Activity Logs
            </h3>
            <span style={{ backgroundColor: '#fef2f2', color: '#ef4444', fontSize: '0.55rem', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '900' }}>LIVE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {recentPayments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.75rem' }}>No recent activities.</div>
            ) : recentPayments.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
                {i !== recentPayments.length - 1 && <div style={{ position: 'absolute', left: '2px', top: '16px', bottom: '-16px', width: '2px', backgroundColor: '#f8fafc' }}></div>}
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#3b82f6', marginTop: '5px', zIndex: 1 }}></div>
                <div style={{ flex: 1 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#cbd5e1' }}>
                        {new Date(p.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                   </div>
                   <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', fontWeight: '600', lineHeight: 1.4 }}>
                    Fee Collected: {p.studentFee.student.user.firstName} {p.studentFee.student.user.lastName}
                   </p>
                   <div style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: '800', marginTop: '0.15rem' }}>₹{p.amount.toLocaleString()} • {p.paymentMethod}</div>
                </div>
              </div>
            ))}
            {recentPayments.length < 3 && (
               <div style={{ display: 'flex', gap: '0.75rem', position: 'relative', opacity: 0.6 }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981', marginTop: '5px', zIndex: 1 }}></div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#cbd5e1' }}>System Status</span>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>Academic session 2024-25 is online.</p>
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* Info Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '1.25rem', border: '1px solid #f1f5f9' }}>
             <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="material-symbols-rounded" style={{ color: '#10b981', fontSize: '1rem' }}>event</span>
                Upcoming
             </h4>
             <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px dashed #e2e8f0' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600' }}>No events today</p>
             </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '1.25rem', border: '1px solid #f1f5f9' }}>
             <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="material-symbols-rounded" style={{ color: '#ec4899', fontSize: '1rem' }}>cake</span>
                Birthdays
             </h4>
             {todaysBirthdays.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#fff1f2', borderRadius: '10px', border: '1px dashed #fecdd3' }}>
                   <p style={{ margin: 0, fontSize: '0.7rem', color: '#f43f5e', fontWeight: '700' }}>None today</p>
                </div>
             ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                   {todaysBirthdays.map(s => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem', backgroundColor: '#fff1f2', borderRadius: '10px' }}>
                         <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: '900' }}>
                            {s.user.firstName[0]}{s.user.lastName?.[0] || ''}
                         </div>
                         <div>
                            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', color: '#9f1239' }}>{s.user.firstName}</p>
                            <p style={{ margin: 0, fontSize: '0.6rem', color: '#f43f5e', fontWeight: '700' }}>{s.enrollments[0]?.class.name}</p>
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '1.25rem', border: '1px solid #f1f5f9' }}>
             <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="material-symbols-rounded" style={{ color: '#f59e0b', fontSize: '1rem' }}>campaign</span>
                Notices
             </h4>
             <div style={{ backgroundColor: '#fdf6b2', padding: '0.75rem', borderRadius: '12px', border: '1px solid #fce96a' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#713f12', lineHeight: 1.4, fontWeight: '600' }}>
                   Term 2 fees are now due. Please process via portal.
                </p>
             </div>
          </div>

        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      `}</style>
    </main>
  );
}
