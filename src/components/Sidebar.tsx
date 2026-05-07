'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/login/actions';
import { useState, useEffect } from 'react';

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
  const [isManualCollapsed, setIsManualCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [ignoreHover, setIgnoreHover] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  // The sidebar is open if it's NOT manually collapsed OR if it's hovered (and not being ignored)
  const isExpanded = !isManualCollapsed || (isHovered && !ignoreHover);

  const menuGroups = [
    {
      title: 'DASHBOARD',
      icon: 'dashboard',
      path: `/school/${tenantId}`
    },
    {
      title: 'STUDENT INFO',
      icon: 'person',
      items: [
        { name: 'Student List', path: `/school/${tenantId}/students`, icon: 'group' },
        { name: 'Admission', path: `/school/${tenantId}/students/admission`, icon: 'person_add' },
        { name: 'Assign Roll No', path: `/school/${tenantId}/students/assign-roll`, icon: 'format_list_numbered' },
        { name: 'Attendance', path: `/school/${tenantId}/attendance`, icon: 'calendar_month' },
      ]
    },
    {
      title: 'FEES MANAGEMENT',
      icon: 'payments',
      items: [
        { name: 'Collect Fees', path: `/school/${tenantId}/fees/collect`, icon: 'account_balance_wallet' },
        { name: 'Fee Search', path: `/school/${tenantId}/fees/search`, icon: 'search' },
        { name: 'Fee Reports', path: `/school/${tenantId}/reports/fees`, icon: 'assessment' },
      ]
    },
    {
      title: 'ACADEMIC',
      icon: 'school',
      items: [
        { name: 'Class & Sections', path: `/school/${tenantId}/academic`, icon: 'grid_view' },
        { name: 'Subjects', path: `/school/${tenantId}/subjects`, icon: 'book' },
        { name: 'Timetable', path: `/school/${tenantId}/timetable`, icon: 'calendar_today' },
        { name: 'Exams', path: `/school/${tenantId}/exams`, icon: 'description' },
      ]
    },
    {
      title: 'OPERATIONS',
      icon: 'hub',
      items: [
        { name: 'Transport', path: `/school/${tenantId}/transport`, icon: 'directions_bus' },
        { name: 'Certificates', path: `/school/${tenantId}/certificates`, icon: 'workspace_premium' },
        { name: 'Notifications', path: `/school/${tenantId}/notifications`, icon: 'notifications' },
      ]
    }
  ];

  const toggleGroup = (title: string) => {
    if (!isExpanded) {
        setIsManualCollapsed(false);
        setOpenGroups([title]);
        return;
    }
    setOpenGroups(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  useEffect(() => {
    // Auto-open group containing active path
    menuGroups.forEach(group => {
      if (group.items?.some(item => pathname === item.path)) {
        if (!openGroups.includes(group.title)) {
          setOpenGroups(prev => [...prev, group.title]);
        }
      }
    });
  }, [pathname]);

  const checkActive = (path: string) => pathname === path;

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIgnoreHover(false); // Re-enable hover features once the mouse has left the area
      }}
      style={{ 
        width: isExpanded ? '280px' : '80px', 
        backgroundColor: '#0f172a', 
        color: '#f8fafc', 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        borderRight: '1px solid #1e293b',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100,
      }}
    >
      {/* Sidebar Header */}
      <div style={{ 
        padding: isExpanded ? '1.5rem 1.25rem' : '1.5rem 0.5rem', 
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isExpanded ? 'flex-start' : 'center',
        gap: '0.5rem',
        overflow: 'hidden',
        position: 'relative',
        minHeight: '80px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          width: '100%', 
          justifyContent: isExpanded ? 'space-between' : 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            {logoUrl ? (
              <img src={logoUrl} style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '6px' }} alt="Logo" />
            ) : (
              <span className="material-symbols-rounded" style={{ color: '#38bdf8', fontSize: '1.75rem' }}>rocket_launch</span>
            )}
            {isExpanded && (
              <span style={{ 
                fontSize: '0.95rem', 
                fontWeight: '700', 
                color: '#f8fafc',
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap' 
              }}>
                {schoolName}
              </span>
            )}
          </div>

          {isExpanded && (
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsManualCollapsed(true);
                setIgnoreHover(true); // Tell the system to ignore hover until the mouse leaves
              }}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                padding: '4px',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>menu_open</span>
            </button>
          )}
        </div>
        {!isExpanded && (
           <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              setIsManualCollapsed(false);
              setIgnoreHover(false); // Manual expand should definitely be open
            }}
            style={{
              marginTop: '1rem',
              background: '#38bdf8',
              border: 'none',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a'
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>chevron_right</span>
          </button>
        )}
      </div>
      
      {/* Navigation */}
      <nav style={{ padding: '1rem 0.5rem', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {menuGroups.map((group) => {
          const isOpen = openGroups.includes(group.title);
          const hasActiveChild = group.items?.some(item => checkActive(item.path));
          
          return (
            <div key={group.title} style={{ marginBottom: '0.5rem' }}>
              {group.path ? (
                <Link 
                  href={group.path}
                  onClick={() => setIsManualCollapsed(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isExpanded ? 'flex-start' : 'center',
                    gap: isExpanded ? '0.75rem' : '0',
                    padding: '0.75rem',
                    color: checkActive(group.path) ? '#38bdf8' : '#94a3b8',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    backgroundColor: checkActive(group.path) ? '#1e293b' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <span className="material-symbols-rounded">{group.icon}</span>
                  {isExpanded && <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{group.title}</span>}
                </Link>
              ) : (
                <>
                  <div 
                    onClick={() => toggleGroup(group.title)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isExpanded ? 'space-between' : 'center',
                      padding: '0.75rem',
                      color: hasActiveChild ? '#f8fafc' : '#94a3b8',
                      cursor: 'pointer',
                      borderRadius: '10px',
                      backgroundColor: hasActiveChild && !isOpen ? '#1e293b' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="material-symbols-rounded">{group.icon}</span>
                      {isExpanded && <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{group.title}</span>}
                    </div>
                    {isExpanded && (
                      <span className="material-symbols-rounded" style={{ 
                        fontSize: '1.2rem', 
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s'
                      }}>expand_more</span>
                    )}
                  </div>
                  
                  {isOpen && isExpanded && (
                    <div style={{ paddingLeft: '1.5rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {group.items?.map(item => (
                        <Link 
                          key={item.path}
                          href={item.path}
                          onClick={() => setIsManualCollapsed(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.85rem',
                            padding: '0.75rem 1rem',
                            color: checkActive(item.path) ? '#38bdf8' : '#64748b',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            borderRadius: '10px',
                            backgroundColor: checkActive(item.path) ? '#1e293b' : 'transparent',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ 
                            width: '4px', 
                            height: '4px', 
                            borderRadius: '50%', 
                            backgroundColor: checkActive(item.path) ? '#38bdf8' : '#334155',
                            opacity: checkActive(item.path) ? 1 : 0.5 
                          }}></div>
                          <span className="material-symbols-rounded" style={{ fontSize: '1.15rem' }}>{item.icon}</span>
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '1rem 0.5rem', borderTop: '1px solid #1e293b', backgroundColor: '#020617' }}>
        <button onClick={() => logoutAction()} style={{ 
          background: 'none', border: 'none', padding: '0.75rem', cursor: 'pointer', color: '#ef4444', 
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: isExpanded ? 'flex-start' : 'center',
          gap: '0.75rem', fontWeight: '600', fontSize: '0.85rem', borderRadius: '10px'
        }}>
          <span className="material-symbols-rounded">logout</span>
          {isExpanded && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
