import SuperadminSidebar from '@/components/SuperadminSidebar';
import SuperadminProfileMenu from '@/components/SuperadminProfileMenu';

export const metadata = {
  title: 'Super Admin — My Digital Academy',
  description: 'My Digital Academy Super Admin Control Panel',
};

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: '#050a15',
    }}>
      <SuperadminSidebar />
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
      }}>
        {/* Topbar */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(248, 250, 252, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 2.5rem',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              backgroundColor: '#ede9fe',
              color: '#7c3aed',
              padding: '0.25rem 0.75rem',
              borderRadius: '99px',
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: '1px solid #ddd6fe',
            }}>
              ● Super Admin Portal
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
              My Digital Academy v2.0
            </div>
            <SuperadminProfileMenu />
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
