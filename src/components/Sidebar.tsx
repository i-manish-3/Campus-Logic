'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/login/actions';
import { useState, useEffect } from 'react';

export default function Sidebar({
  tenantId,
  schoolName,
  logoUrl,
  permissions = []
}: {
  tenantId: string,
  schoolName: string,
  logoUrl?: string | null,
  permissions?: string[]
}) {
  const pathname = usePathname();
  const [isManualCollapsed, setIsManualCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [ignoreHover, setIgnoreHover] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  // If permissions include '*', user is a superadmin or has all access
  const hasAllAccess = permissions.includes('*');

  const menuGroups = [
    {
      title: 'DASHBOARD',
      icon: 'dashboard',
      path: `/school/${tenantId}`,
      permission: null // Always visible
    },
    {
      title: 'STUDENT INFO',
      icon: 'person',
      items: [
        { name: 'Admission', path: `/school/${tenantId}/students/admission`, icon: 'person_add', permission: 'manage_admission' },
        { name: 'Student List', path: `/school/${tenantId}/students`, icon: 'group', permission: 'view_students' },
        // { name: 'Assign Roll No', path: `/school/${tenantId}/students/assign-roll`, icon: 'format_list_numbered', permission: 'edit_students' },
        // { name: 'Attendance', path: `/school/${tenantId}/attendance`, icon: 'calendar_month', permission: 'manage_academic' },
      ]
    },
    {
      title: 'FEES MANAGEMENT',
      icon: 'payments',
      items: [
        { name: 'Create Fees', path: `/school/${tenantId}/fees`, icon: 'add_card' },
        { name: 'Collect Fees', path: `/school/${tenantId}/fees/collect`, icon: 'account_balance_wallet', permission: 'collect_fees' },
        { name: 'Fee Groups', path: `/school/${tenantId}/fees/groups`, icon: 'groups', permission: 'view_fees' },
        { name: 'Fee Search', path: `/school/${tenantId}/fees/search`, icon: 'search', permission: 'view_fees' },
        { name: 'Fee Reports', path: `/school/${tenantId}/reports/fees`, icon: 'analytics', permission: 'view_fees' },
      ]
    },
    {
      title: 'ACADEMIC',
      icon: 'school',
      items: [
        { name: 'Class & Sections', path: `/school/${tenantId}/academic`, icon: 'grid_view', permission: 'manage_academic' },
        { name: 'Subjects', path: `/school/${tenantId}/subjects`, icon: 'book', permission: 'manage_academic' },
        { name: 'Timetable', path: `/school/${tenantId}/timetable`, icon: 'calendar_today', permission: 'manage_academic' },
        { name: 'Exams', path: `/school/${tenantId}/exams`, icon: 'description', permission: 'view_exams' },
      ]
    },
    {
      title: 'TRANSPORT',
      icon: 'directions_bus',
      items: [
        { name: 'Create Route', path: `/school/${tenantId}/transport/create`, icon: 'add_location_alt', permission: 'manage_transport' },
        { name: 'Route List', path: `/school/${tenantId}/transport`, icon: 'list_alt', permission: 'manage_transport' },
        { name: 'Add Driver', path: `/school/${tenantId}/transport/drivers/create`, icon: 'person_add', permission: 'manage_transport' },
        { name: 'Driver List', path: `/school/${tenantId}/transport/drivers`, icon: 'badge', permission: 'manage_transport' },
      ]
    },
    {
      title: 'OPERATIONS',
      icon: 'hub',
      items: [
        { name: 'Certificates', path: `/school/${tenantId}/certificates`, icon: 'workspace_premium', permission: 'view_students' },
        { name: 'Notifications', path: `/school/${tenantId}/notifications`, icon: 'notifications', permission: 'manage_settings' },
        { name: 'Staff Roles', path: `/school/${tenantId}/settings/roles`, icon: 'security', permission: 'manage_settings' },
        { name: 'School Settings', path: `/school/${tenantId}/settings`, icon: 'settings', permission: 'manage_settings' },
      ]
    }
  ];

  // Filter groups and items based on permissions
  const filteredGroups = menuGroups.map(group => {
    if (hasAllAccess) return group;
    if (group.path && !group.permission) return group;

    if (group.items) {
      const filteredItems = group.items.filter(item => !item.permission || permissions.includes(item.permission));
      if (filteredItems.length > 0) {
        return { ...group, items: filteredItems };
      }
    }

    return null;
  }).filter(Boolean) as typeof menuGroups;

  // The sidebar is open if it's NOT manually collapsed OR if it's hovered (and not being ignored)
  const isExpanded = !isManualCollapsed || (isHovered && !ignoreHover);

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
    const activeGroup = filteredGroups.find(group => 
      group.items?.some(item => pathname === item.path)
    );
    
    if (activeGroup && !openGroups.includes(activeGroup.title)) {
      setOpenGroups(prev => [...prev, activeGroup.title]);
    }
  }, [pathname]);

  const checkActive = (path: string) => pathname === path;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIgnoreHover(false);
      }}
      style={{
        width: isExpanded ? '280px' : '80px',
        background: 'linear-gradient(180deg, #0d9488 0%, #0f766e 100%)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        borderRight: '1px solid rgba(255,255,255,0.1)',
        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100,
        boxShadow: '4px 0 24px rgba(13, 148, 136, 0.15)',
        overflow: 'hidden'
      }}
    >
      {/* Sidebar Header */}
      <div style={{
        padding: '1.5rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        position: 'relative',
        minHeight: '80px',
        transition: 'padding 0.4s'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
            <div style={{ flexShrink: 0, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {logoUrl ? (
                <img src={logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }} alt="Logo" />
              ) : (
                <span className="material-symbols-rounded" style={{ color: '#fff', fontSize: '1.75rem' }}>school</span>
              )}
            </div>
            <span style={{
              fontSize: '0.95rem',
              fontWeight: '700',
              color: '#fff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? '100%' : '0',
              visibility: isExpanded ? 'visible' : 'hidden'
            }}>
              {schoolName}
            </span>
          </div>

          <div style={{
            transition: 'all 0.4s',
            opacity: isExpanded ? 1 : 0,
            width: isExpanded ? 'auto' : '0',
            visibility: isExpanded ? 'visible' : 'hidden',
            flexShrink: 0
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsManualCollapsed(true);
                setIgnoreHover(true);
              }}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '4px',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>menu_open</span>
            </button>
          </div>
        </div>
        
        {!isExpanded && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.4s',
            opacity: isExpanded ? 0 : 1,
            visibility: isExpanded ? 'hidden' : 'visible'
          }}>
             {/* Simple spacer or could add a small indicator here */}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ padding: '1rem 0.5rem', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {filteredGroups.map((group) => {
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
                    padding: '0.75rem',
                    color: checkActive(group.path) ? '#fff' : 'rgba(255,255,255,0.7)',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    backgroundColor: checkActive(group.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                    backgroundImage: checkActive(group.path) ? 'linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)' : 'none',
                    boxShadow: checkActive(group.path) ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s',
                    overflow: 'hidden'
                  }}
                >
                  <span className="material-symbols-rounded" style={{ flexShrink: 0, width: '24px', textAlign: 'center' }}>{group.icon}</span>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: '700', 
                    letterSpacing: '0.02em',
                    marginLeft: '0.75rem',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: isExpanded ? 1 : 0,
                    width: isExpanded ? '100%' : '0',
                    visibility: isExpanded ? 'visible' : 'hidden',
                    whiteSpace: 'nowrap'
                  }}>
                    {group.title}
                  </span>
                </Link>
              ) : (
                <>
                  <div
                    onClick={() => toggleGroup(group.title)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      color: hasActiveChild ? '#fff' : 'rgba(255,255,255,0.7)',
                      cursor: 'pointer',
                      borderRadius: '10px',
                      backgroundColor: hasActiveChild && !isOpen ? 'rgba(255,255,255,0.15)' : 'transparent',
                      transition: 'all 0.2s',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                      <span className="material-symbols-rounded" style={{ flexShrink: 0, width: '24px', textAlign: 'center' }}>{group.icon}</span>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: '700', 
                        letterSpacing: '0.02em',
                        marginLeft: '0.75rem',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: isExpanded ? 1 : 0,
                        width: isExpanded ? '100%' : '0',
                        visibility: isExpanded ? 'visible' : 'hidden',
                        whiteSpace: 'nowrap'
                      }}>
                        {group.title}
                      </span>
                    </div>
                    <span className="material-symbols-rounded" style={{
                      fontSize: '1.2rem',
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: isExpanded ? 1 : 0,
                      width: isExpanded ? 'auto' : '0',
                      visibility: isExpanded ? 'visible' : 'hidden',
                      flexShrink: 0
                    }}>expand_more</span>
                  </div>

                  <div style={{ 
                    display: 'grid',
                    gridTemplateRows: (isOpen && isExpanded) ? '1fr' : '0fr',
                    transition: 'grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s',
                    opacity: (isOpen && isExpanded) ? 1 : 0,
                    visibility: (isOpen && isExpanded) ? 'visible' : 'hidden'
                  }}>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ paddingLeft: '1rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {group.items?.map(item => (
                          <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => setIsManualCollapsed(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0.65rem 1rem',
                              color: checkActive(item.path) ? '#fff' : 'rgba(255,255,255,0.6)',
                              textDecoration: 'none',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              borderRadius: '8px',
                              backgroundColor: checkActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                              transition: 'all 0.2s',
                              overflow: 'hidden'
                            }}
                          >
                            <span className="material-symbols-rounded" style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                            <span style={{
                              marginLeft: '0.85rem',
                              transition: 'all 0.4s',
                              opacity: isExpanded ? 1 : 0,
                              whiteSpace: 'nowrap'
                            }}>
                              {item.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '1rem 0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0b7a6f', overflow: 'hidden' }}>
        <button onClick={() => logoutAction()} style={{
          background: 'none', border: 'none', padding: '0.75rem', cursor: 'pointer', color: '#ffb3b3',
          width: '100%', display: 'flex', alignItems: 'center',
          fontWeight: '700', fontSize: '0.85rem', borderRadius: '10px', transition: 'all 0.2s'
        }}>
          <span className="material-symbols-rounded" style={{ flexShrink: 0, width: '24px', textAlign: 'center' }}>logout</span>
          <span style={{
            marginLeft: '0.75rem',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: isExpanded ? 1 : 0,
            width: isExpanded ? '100%' : '0',
            visibility: isExpanded ? 'visible' : 'hidden',
            whiteSpace: 'nowrap'
          }}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}
