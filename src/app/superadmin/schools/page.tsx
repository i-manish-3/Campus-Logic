import prisma from '@/lib/prisma';
import Link from 'next/link';
import SuspendToggle from './SuspendToggle';
import ResetPasswordModal from './ResetPasswordModal';
import EditSchoolModal from './EditSchoolModal';

export default async function SchoolsPage() {
  const [tenants, studentCounts, revenueCounts] = await Promise.all([
    prisma.tenant.findMany({ 
      orderBy: { createdAt: 'desc' },
      include: { users: { where: { role: { name: 'School Admin' } }, select: { email: true } } }
    }),
    prisma.studentProfile.groupBy({ by: ['tenantId'], _count: { id: true } }),
    prisma.feePayment.groupBy({ by: ['tenantId'], _sum: { amount: true } }),
  ]);

  const studentMap: Record<string, number> = {};
  for (const r of studentCounts) studentMap[r.tenantId] = r._count.id;

  const revenueMap: Record<string, number> = {};
  for (const r of revenueCounts) revenueMap[r.tenantId] = r._sum.amount ?? 0;

  const activeTenants = tenants.filter(t => t.isActive).length;

  return (
    <main style={{ padding: '2.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>All Schools</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: '0.95rem' }}>
            {tenants.length} registered · {activeTenants} active
          </p>
        </div>
        <Link href="/superadmin/onboard" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px',
          textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem',
          boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>add_business</span>
          Onboard New School
        </Link>
      </div>

      {/* Summary Pills */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Schools', value: tenants.length, color: '#6366f1', bg: '#ede9fe' },
          { label: 'Active', value: activeTenants, color: '#10b981', bg: '#d1fae5' },
          { label: 'Suspended', value: tenants.length - activeTenants, color: '#ef4444', bg: '#fee2e2' },
          { label: 'Total Students', value: Object.values(studentMap).reduce((a, b) => a + b, 0).toLocaleString(), color: '#0ea5e9', bg: '#e0f2fe' },
        ].map(pill => (
          <div key={pill.label} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: pill.bg, color: pill.color,
            padding: '0.5rem 1rem', borderRadius: '99px',
            fontSize: '0.8rem', fontWeight: '700',
          }}>
            <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>{pill.value}</span>
            {pill.label}
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        {tenants.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>corporate_fare</span>
            <p style={{ margin: 0, fontSize: '1.1rem' }}>No schools registered yet.</p>
            <Link href="/superadmin/onboard" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '600', marginTop: '1rem', display: 'inline-block' }}>
              → Onboard the first school
            </Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['School', 'Domain & Admin', 'Students', 'Revenue', 'Status', 'Joined', 'Actions'].map(col => (
                  <th key={col} style={{
                    padding: '1rem 1.25rem', textAlign: 'left',
                    fontSize: '0.75rem', fontWeight: '700', color: '#475569',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant, i) => {
                const students = studentMap[tenant.id] ?? 0;
                const revenue = revenueMap[tenant.id] ?? 0;
                const avatarColors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
                const avatarGrads = ['#8b5cf6', '#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'];
                const ci = i % 6;
                return (
                  <tr key={tenant.id} style={{
                    borderBottom: '1px solid #f8fafc',
                    opacity: tenant.isActive ? 1 : 0.65,
                  }}>
                    {/* School Name */}
                    <td style={{ padding: '1.1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                          background: `linear-gradient(135deg, ${avatarColors[ci]}, ${avatarGrads[ci]})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: '700', fontSize: '0.85rem',
                        }}>
                          {tenant.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>{tenant.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{tenant.id.slice(0, 8)}…</div>
                        </div>
                      </div>
                    </td>
                    {/* Domain & Admin */}
                    <td style={{ padding: '1.1rem 1.25rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span style={{
                          fontFamily: 'monospace', fontSize: '0.8rem',
                          backgroundColor: '#f1f5f9', padding: '0.25rem 0.6rem', borderRadius: '6px',
                          color: '#334155', fontWeight: '600', alignSelf: 'flex-start'
                        }}>
                          /{tenant.domain ?? tenant.id.slice(0, 8)}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span className="material-symbols-rounded" style={{ fontSize: '0.9rem' }}>shield_person</span>
                          {tenant.users[0]?.email || 'No Admin'}
                        </div>
                      </div>
                    </td>
                    {/* Students */}
                    <td style={{ padding: '1.1rem 1.25rem', fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>
                      {students.toLocaleString()}
                    </td>
                    {/* Revenue */}
                    <td style={{ padding: '1.1rem 1.25rem', fontWeight: '700', color: '#059669', fontSize: '0.9rem' }}>
                      ₹{revenue.toLocaleString('en-IN')}
                    </td>
                    {/* Status */}
                    <td style={{ padding: '1.1rem 1.25rem' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        fontSize: '0.75rem', fontWeight: '700', padding: '0.3rem 0.7rem', borderRadius: '99px',
                        backgroundColor: tenant.isActive ? '#d1fae5' : '#fee2e2',
                        color: tenant.isActive ? '#065f46' : '#991b1b',
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }} />
                        {tenant.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    {/* Joined */}
                    <td style={{ padding: '1.1rem 1.25rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                      {new Date(tenant.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '1.1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Link href={`/school/${tenant.id}`} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.45rem 0.9rem', borderRadius: '8px',
                          backgroundColor: '#ede9fe', color: '#6366f1',
                          textDecoration: 'none', fontSize: '0.78rem', fontWeight: '700',
                        }}>
                          <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>open_in_new</span>
                          Portal
                        </Link>
                        <EditSchoolModal tenant={tenant} />
                        <ResetPasswordModal tenantId={tenant.id} tenantName={tenant.name} />
                        <SuspendToggle tenantId={tenant.id} isActive={tenant.isActive} />
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
