'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/login/actions';

const navItems = [
  { name: 'Overview', path: '/superadmin', icon: 'dashboard' },
  { name: 'All Schools', path: '/superadmin/schools', icon: 'corporate_fare' },
  { name: 'Onboard School', path: '/superadmin/onboard', icon: 'add_business' },
];

export default function SuperadminSidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      background: 'linear-gradient(180deg, #020617 0%, #0a0f1e 100%)',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      borderRight: '1px solid #0f172a',
      flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{
        padding: '1.75rem 1.5rem',
        borderBottom: '1px solid #0f172a',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: '1.25rem', color: 'white' }}>rocket_launch</span>
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: 'white', letterSpacing: '-0.01em' }}>Campus-Logic</div>
            <div style={{ fontSize: '0.65rem', color: '#6366f1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Super Admin</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1.25rem 0.75rem', overflowY: 'auto' }}>
        <p style={{ fontSize: '0.65rem', color: '#334155', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: '0.75rem', marginBottom: '0.5rem' }}>
          Platform Control
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {navItems.map(item => {
            const active = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.7rem 0.75rem',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: active ? 'white' : '#64748b',
                    background: active ? 'linear-gradient(135deg, #6366f115, #8b5cf615)' : 'transparent',
                    fontWeight: active ? '600' : '500',
                    fontSize: '0.9rem',
                    border: active ? '1px solid #6366f130' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span className="material-symbols-rounded" style={{
                    fontSize: '1.2rem',
                    color: active ? '#818cf8' : '#475569',
                  }}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>

        <div style={{ height: '1px', backgroundColor: '#0f172a', margin: '1.5rem 0' }} />

        <p style={{ fontSize: '0.65rem', color: '#334155', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: '0.75rem', marginBottom: '0.5rem' }}>
          Quick Links
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <li>
            <Link href="/" style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.7rem 0.75rem', borderRadius: '10px', textDecoration: 'none',
              color: '#475569', fontWeight: '500', fontSize: '0.85rem',
              border: '1px solid transparent',
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: '1.1rem', color: '#334155' }}>home</span>
              Landing Page
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div style={{ padding: '1.25rem', borderTop: '1px solid #0f172a' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem', borderRadius: '10px', background: '#0f172a',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: '700', color: 'white',
            flexShrink: 0,
          }}>SA</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Super Admin</div>
            <div style={{ fontSize: '0.7rem', color: '#475569' }}>superadmin</div>
          </div>
          <form action={logoutAction}>
            <button type="submit" style={{
              background: 'none', border: 'none', color: '#475569', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0.25rem', borderRadius: '6px', transition: 'color 0.2s'
            }} title="Sign out"
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#475569'}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>logout</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
