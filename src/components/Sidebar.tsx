'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/login/actions';

export default function Sidebar({ 
  tenantId, 
  schoolName,
  logoUrl
}: { 
  tenantId: string, 
  schoolName: string,
  logoUrl?: string | null
}) {
  const pathname = usePathname();

  const menuGroups = [
    {
      title: 'CORE',
      items: [
        { name: 'Dashboard', path: `/school/${tenantId}`, icon: 'dashboard' },
        { name: 'Academic Setup', path: `/school/${tenantId}/academic`, icon: 'school' },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { name: 'Collect Fees', path: `/school/${tenantId}/fees/collect`, icon: 'account_balance_wallet' },
        { name: 'Students', path: `/school/${tenantId}/students`, icon: 'group' },
        { name: 'Fees Management', path: `/school/${tenantId}/fees`, icon: 'payments' },
        { name: 'Transport', path: `/school/${tenantId}/transport`, icon: 'directions_bus' },
        { name: 'Subjects', path: `/school/${tenantId}/subjects`, icon: 'book' },
        { name: 'Timetable', path: `/school/${tenantId}/timetable`, icon: 'calendar_today' },
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { name: 'Fees Report', path: `/school/${tenantId}/reports/fees`, icon: 'assessment' },
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Exams', path: `/school/${tenantId}/exams`, icon: 'description' },
        { name: 'Forms', path: `/school/${tenantId}/forms`, icon: 'dynamic_form' },
        { name: 'Certificates', path: `/school/${tenantId}/certificates`, icon: 'workspace_premium' },
        { name: 'Notifications', path: `/school/${tenantId}/notifications`, icon: 'notifications' },
      ]
    },
    {
      title: 'CONFIGURATION',
      items: [
        { name: 'School Settings', path: `/school/${tenantId}/settings`, icon: 'settings' },
      ]
    }
  ];

  const checkActive = (path: string) => pathname === path;

  return (
    <aside style={{ 
      width: '280px', 
      backgroundColor: '#0f172a', 
      color: '#f8fafc', 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      borderRight: '1px solid #1e293b'
    }}>
      <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #1e293b' }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.25rem', 
          fontWeight: '700', 
          color: '#38bdf8',
          letterSpacing: '-0.025em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          {logoUrl ? (
            <img src={logoUrl} style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '6px' }} alt="Logo" />
          ) : (
            <span className="material-symbols-rounded">rocket_launch</span>
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{schoolName}</span>
        </h2>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', display: 'block', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          School Management Suite
        </span>
      </div>
      
      <nav style={{ padding: '1.5rem 1rem', flex: 1, overflowY: 'auto' }}>
        {menuGroups.map((group, idx) => (
          <div key={group.title} style={{ marginBottom: idx === menuGroups.length - 1 ? 0 : '2rem' }}>
            <h3 style={{ 
              fontSize: '0.7rem', 
              color: '#475569', 
              fontWeight: '700', 
              marginBottom: '0.75rem', 
              paddingLeft: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              {group.title}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {group.items.map((item) => {
                const active = checkActive(item.path);
                return (
                  <li key={item.path}>
                    <Link 
                      href={item.path} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem', 
                        color: active ? '#f8fafc' : '#94a3b8', 
                        backgroundColor: active ? '#1e293b' : 'transparent',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: active ? '600' : '500',
                        transition: 'all 0.2s ease',
                        borderLeft: active ? '3px solid #38bdf8' : '3px solid transparent'
                      }}
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div style={{ padding: '1.5rem', borderTop: '1px solid #1e293b', backgroundColor: '#020617' }}>
        <button onClick={() => logoutAction()} style={{ 
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: '#ef4444', 
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: '500'
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
