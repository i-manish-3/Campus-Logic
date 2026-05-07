import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function SuperadminDashboard() {
  // ── Live Platform Stats ──────────────────────────────────────────────────
  const [
    totalTenants,
    activeTenants,
    suspendedTenants,
    totalStudents,
    totalPaymentsAgg,
    recentTenants,
    tenantStudentCounts,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { isActive: true } }),
    prisma.tenant.count({ where: { isActive: false } }),
    prisma.studentProfile.count(),
    prisma.feePayment.aggregate({ _sum: { amount: true } }),
    prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, name: true, domain: true, isActive: true, createdAt: true }
    }),
    prisma.studentProfile.groupBy({
      by: ['tenantId'],
      _count: { id: true },
    }),
  ]);

  const totalRevenue = totalPaymentsAgg._sum.amount ?? 0;

  const studentCountMap: Record<string, number> = {};
  for (const row of tenantStudentCounts) {
    studentCountMap[row.tenantId] = row._count.id;
  }

  const stats = [
    {
      label: 'Total Schools',
      value: totalTenants.toLocaleString(),
      sub: `${activeTenants} active · ${suspendedTenants} suspended`,
      icon: 'corporate_fare',
      color: '#6366f1',
      bg: '#ede9fe',
      link: '/superadmin/schools',
    },
    {
      label: 'Total Students',
      value: totalStudents.toLocaleString(),
      sub: 'Across all schools',
      icon: 'group',
      color: '#0ea5e9',
      bg: '#e0f2fe',
      link: '/superadmin/schools',
    },
    {
      label: 'Platform Revenue',
      value: `₹${(totalRevenue / 1_00_000).toFixed(2)}L`,
      sub: `₹${totalRevenue.toLocaleString('en-IN')} total collected`,
      icon: 'payments',
      color: '#10b981',
      bg: '#d1fae5',
      link: '/superadmin/schools',
    },
    {
      label: 'Active Schools',
      value: activeTenants.toLocaleString(),
      sub: `${Math.round((activeTenants / Math.max(totalTenants, 1)) * 100)}% uptime rate`,
      icon: 'check_circle',
      color: '#f59e0b',
      bg: '#fef3c7',
      link: '/superadmin/schools',
    },
  ];

  return (
    <main style={{ padding: '2.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>
          Platform Overview
        </h1>
        <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: '0.95rem' }}>
          Real-time insights across all My Digital Academy tenants.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {stats.map(s => (
          <Link key={s.label} href={s.link} style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '1.75rem',
              border: '1px solid #f1f5f9',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Color accent top strip */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: `linear-gradient(90deg, ${s.color}, ${s.color}80)`,
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{
                  backgroundColor: s.bg,
                  width: '44px', height: '44px', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: s.color,
                }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '1.35rem' }}>{s.icon}</span>
                </div>
                <span className="material-symbols-rounded" style={{ fontSize: '1.1rem', color: '#cbd5e1' }}>arrow_forward</span>
              </div>
              <p style={{ margin: '0 0 0.3rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
              <p style={{ margin: '0 0 0.4rem', fontSize: '2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em' }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>{s.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Two-column grid: Recent schools + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Recent Schools */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '1.5rem 1.75rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Recently Onboarded</h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>Latest schools on the platform</p>
            </div>
            <Link href="/superadmin/schools" style={{
              fontSize: '0.8rem', color: '#6366f1', textDecoration: 'none', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '0.25rem',
            }}>
              View all <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>arrow_forward</span>
            </Link>
          </div>
          <div>
            {recentTenants.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>corporate_fare</span>
                <p style={{ margin: 0 }}>No schools onboarded yet.</p>
              </div>
            ) : (
              recentTenants.map((t, i) => (
                <div key={t.id} style={{
                  padding: '1.1rem 1.75rem',
                  borderBottom: i < recentTenants.length - 1 ? '1px solid #f8fafc' : 'none',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                    background: `linear-gradient(135deg, ${['#6366f1','#0ea5e9','#10b981','#f59e0b','#ec4899','#8b5cf6'][i % 6]}, ${['#8b5cf6','#38bdf8','#34d399','#fbbf24','#f472b6','#a78bfa'][i % 6]})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: '700', fontSize: '0.9rem',
                  }}>
                    {t.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/{t.domain} · {studentCountMap[t.id] ?? 0} students</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '99px',
                      backgroundColor: t.isActive ? '#d1fae5' : '#fee2e2',
                      color: t.isActive ? '#065f46' : '#991b1b',
                    }}>
                      {t.isActive ? 'Active' : 'Suspended'}
                    </span>
                    <Link href={`/school/${t.id}`} style={{
                      width: '30px', height: '30px', borderRadius: '8px', backgroundColor: '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#64748b', textDecoration: 'none',
                    }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>open_in_new</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick Actions */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            padding: '1.5rem',
          }}>
            <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/superadmin/onboard" style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.9rem 1rem', borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                textDecoration: 'none', color: 'white',
                fontWeight: '600', fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>add_business</span>
                Onboard New School
              </Link>
              <Link href="/superadmin/schools" style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.9rem 1rem', borderRadius: '12px',
                backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                textDecoration: 'none', color: '#334155',
                fontWeight: '600', fontSize: '0.9rem',
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: '1.2rem', color: '#6366f1' }}>manage_accounts</span>
                Manage All Schools
              </Link>
            </div>
          </div>

          {/* Platform Info */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
            borderRadius: '20px',
            padding: '1.5rem',
            color: 'white',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '1.1rem', color: '#818cf8' }}>info</span>
              <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#e2e8f0' }}>Platform Status</span>
            </div>
            {[
              { label: 'Version', value: '2.0.0' },
              { label: 'DB Status', value: '● Healthy', valueColor: '#4ade80' },
              { label: 'Active Tenants', value: `${activeTenants} / ${totalTenants}` },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.5rem 0',
                borderBottom: '1px solid #ffffff10',
              }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{row.label}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: (row as any).valueColor || '#e2e8f0' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
