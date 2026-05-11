'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/login/actions';
import { useState, useEffect } from 'react';

type SidebarLinkItem = {
  name: string;
  path: string;
  icon: string;
  permission?: string;
  highlight?: boolean;
};

type SidebarSectionItem = {
  type: 'section';
  name: string;
  icon?: string;
  items: SidebarLinkItem[];
};

type SidebarItem = SidebarLinkItem | SidebarSectionItem;

const isSectionItem = (item: SidebarItem): item is SidebarSectionItem =>
  'type' in item && item.type === 'section';

const isLinkItem = (item: SidebarItem): item is SidebarLinkItem =>
  !('type' in item);

type MenuGroup = {
  title: string;
  icon: string;
  path?: string;
  permission?: string | null;
  items?: SidebarItem[];
};

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
  const [openSections, setOpenSections] = useState<string[]>([]);

  const hasAllAccess = permissions.includes('*');

  const menuGroups: MenuGroup[] = [
    {
      title: 'DASHBOARD',
      icon: 'dashboard',
      path: `/school/${tenantId}`,
      permission: null
    },
    {
      title: 'STUDENT INFO',
      icon: 'person',
      items: [
        { name: 'Admission', path: `/school/${tenantId}/students/admission`, icon: 'person_add', permission: 'manage_admission' },
        { name: 'Student List', path: `/school/${tenantId}/students`, icon: 'group', permission: 'view_students' },
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
        {
          name: 'Add Session', path: `/school/${tenantId}/academic/sessions/add`, icon: 'date_range', permission: 'manage_academic'
        },
        {
          type: 'section',
          name: 'Subject',
          icon: 'menu_book',
          items: [
            { name: 'Add Subject', path: `/school/${tenantId}/academic/subjects/add`, icon: 'add_circle', permission: 'manage_academic' },
            { name: 'Subject List', path: `/school/${tenantId}/academic/subjects`, icon: 'list_alt', permission: 'manage_academic' },
            { name: 'Question Types', path: `/school/${tenantId}/subjects/qtypes`, icon: 'category', permission: 'manage_academic' },
            { name: 'Question Banks', path: `/school/${tenantId}/subjects/qbank`, icon: 'quiz', permission: 'manage_academic' },
            { name: 'Optional Subjects', path: `/school/${tenantId}/subjects/optional`, icon: 'check_circle', highlight: true, permission: 'manage_academic' },
          ]
        },
        {
          type: 'section',
          name: 'Class',
          icon: 'class',
          items: [
            { name: 'Add Class', path: `/school/${tenantId}/academic/classes`, icon: 'add_circle', permission: 'manage_academic' },
            { name: 'Class List', path: `/school/${tenantId}/academic/classes/list`, icon: 'list_alt', permission: 'manage_academic' },
            { name: 'Promote Students', path: `/school/${tenantId}/academic/promote`, icon: 'trending_up', permission: 'manage_academic' },
          ]
        },
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

  const filteredGroups = menuGroups.map(group => {
    if (hasAllAccess) return group;
    if (group.path && !group.permission) return group;
    if (group.items) {
      const filteredItems = group.items.map(item => {
        if (!isSectionItem(item)) return item;

        const filteredChildItems = item.items.filter(child =>
          !child.permission || permissions.includes(child.permission)
        );

        return filteredChildItems.length > 0
          ? { ...item, items: filteredChildItems }
          : null;
      }).filter(Boolean) as SidebarItem[];

      if (filteredItems.length > 0) {
        return { ...group, items: filteredItems };
      }
    }
    return null;
  }).filter(Boolean) as MenuGroup[];

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

  const toggleSection = (name: string) => {
    setOpenSections(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  useEffect(() => {
    const activeGroup = filteredGroups.find(group =>
      group.items?.some(item => isLinkItem(item) && pathname === item.path)
    );
    if (activeGroup && !openGroups.includes(activeGroup.title)) {
      setOpenGroups(prev => [...prev, activeGroup.title]);
    }

    // Auto-expand section when a child item is active
    const activeSection = filteredGroups.find(group =>
      group.items?.some(item => isSectionItem(item) && item.items.some(child => pathname === child.path))
    );
    if (activeSection) {
      const activeSectionItem = activeSection.items?.find(item =>
        isSectionItem(item) && item.items.some(child => pathname === child.path)
      );
      if (activeSectionItem && !openSections.includes(activeSectionItem.name)) {
        setOpenSections(prev => [...prev, activeSectionItem.name]);
      }
    }
  }, [pathname]);

  const checkActive = (path: string) => pathname === path;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIgnoreHover(false); }}
      style={{
        width: isExpanded ? '280px' : '80px',
        background: 'linear-gradient(180deg, #0d9488 0%, #0f766e 100%)',
        color: '#f8fafc', display: 'flex', flexDirection: 'column', height: '100vh',
        position: 'sticky', top: 0, borderRight: '1px solid rgba(255,255,255,0.1)',
        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 100,
        boxShadow: '4px 0 24px rgba(13, 148, 136, 0.15)', overflow: 'hidden'
      }}
    >
      <div style={{
        padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', minHeight: '80px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
            <div style={{ flexShrink: 0, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {logoUrl ? (
                <img src={logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }} alt="Logo" />
              ) : (
                <span className="material-symbols-rounded" style={{ color: '#fff', fontSize: '1.75rem' }}>school</span>
              )}
            </div>
            <span style={{
              fontSize: '0.95rem', fontWeight: '700', color: '#fff', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: isExpanded ? 1 : 0,
              width: isExpanded ? '100%' : '0', visibility: isExpanded ? 'visible' : 'hidden'
            }}>{schoolName}</span>
          </div>
          <div style={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? 'auto' : '0', visibility: isExpanded ? 'visible' : 'hidden', flexShrink: 0 }}>
            <button onClick={(e) => { e.stopPropagation(); setIsManualCollapsed(true); setIgnoreHover(true); }}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '4px', borderRadius: '6px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>menu_open</span>
            </button>
          </div>
        </div>
      </div>

      <nav style={{ padding: '1rem 0.5rem', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {filteredGroups.map((group) => {
          const isOpen = openGroups.includes(group.title);
          const hasActiveChild = group.items?.some(item => isLinkItem(item) && checkActive(item.path));
          return (
            <div key={group.title} style={{ marginBottom: '0.5rem' }}>
              {group.path ? (
                <Link href={group.path} onClick={() => setIsManualCollapsed(false)}
                  style={{ display: 'flex', alignItems: 'center', padding: '0.75rem', color: checkActive(group.path) ? '#fff' : 'rgba(255,255,255,0.7)', textDecoration: 'none', borderRadius: '10px', backgroundColor: checkActive(group.path) ? 'rgba(255,255,255,0.1)' : 'transparent', transition: 'all 0.2s', overflow: 'hidden' }}>
                  <span className="material-symbols-rounded" style={{ flexShrink: 0, width: '24px', textAlign: 'center' }}>{group.icon}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', marginLeft: '0.75rem', opacity: isExpanded ? 1 : 0, width: isExpanded ? '100%' : '0', visibility: isExpanded ? 'visible' : 'hidden', whiteSpace: 'nowrap' }}>{group.title}</span>
                </Link>
              ) : (
                <>
                  <div onClick={() => toggleGroup(group.title)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', color: hasActiveChild ? '#fff' : 'rgba(255,255,255,0.7)', cursor: 'pointer', borderRadius: '10px', backgroundColor: hasActiveChild && !isOpen ? 'rgba(255,255,255,0.15)' : 'transparent', transition: 'all 0.2s', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                      <span className="material-symbols-rounded" style={{ flexShrink: 0, width: '24px', textAlign: 'center' }}>{group.icon}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', marginLeft: '0.75rem', opacity: isExpanded ? 1 : 0, width: isExpanded ? '100%' : '0', visibility: isExpanded ? 'visible' : 'hidden', whiteSpace: 'nowrap' }}>{group.title}</span>
                    </div>
                    <span className="material-symbols-rounded" style={{ fontSize: '1.2rem', transform: isOpen ? 'rotate(180deg)' : 'none', opacity: isExpanded ? 1 : 0, width: isExpanded ? 'auto' : '0', visibility: isExpanded ? 'visible' : 'hidden', flexShrink: 0 }}>expand_more</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows 0.4s', opacity: isOpen ? 1 : 0, visibility: isOpen ? 'visible' : 'hidden' }}>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ paddingLeft: '1rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {group.items?.map(item => {
                          if (isSectionItem(item)) {
                            const isSectionOpen = openSections.includes(item.name);
                            return (
                              <div key={item.name}>
                                <div
                                  onClick={() => toggleSection(item.name)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.5rem 0.75rem',
                                    color: 'rgba(255,255,255,0.6)',
                                    cursor: 'pointer',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  <span>{item.name}</span>
                                  <span className="material-symbols-rounded" style={{ fontSize: '1rem', transform: isSectionOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>expand_more</span>
                                </div>
                                <div style={{ maxHeight: isSectionOpen ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease-out' }}>
                                  {item.items.map(child => {
                                    const isActiveChild = checkActive(child.path);
                                    return (
                                      <Link key={child.path} href={child.path} onClick={() => setIsManualCollapsed(false)}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          padding: '0.5rem 1rem',
                                          color: isActiveChild ? '#fff' : 'rgba(255,255,255,0.65)',
                                          textDecoration: 'none',
                                          fontSize: '0.85rem',
                                          fontWeight: 500,
                                          borderRadius: '8px',
                                          backgroundColor: isActiveChild ? 'rgba(255,255,255,0.1)' : 'transparent',
                                          transition: 'all 0.2s',
                                        }}>
                                        <span className="material-symbols-rounded" style={{ fontSize: '1rem', flexShrink: 0 }}>{child.icon}</span>
                                        <span style={{ marginLeft: '0.75rem' }}>{child.name}</span>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }

                          const isActiveItem = isLinkItem(item) && checkActive(item.path);
                          const highlight = isLinkItem(item) && item.highlight;

                          return (
                            <Link key={item.path || item.name} href={item.path || '#'} onClick={() => setIsManualCollapsed(false)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.65rem 1rem',
                                color: isActiveItem ? '#fff' : highlight ? '#facc15' : 'rgba(255,255,255,0.75)',
                                textDecoration: 'none',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                borderRadius: '10px',
                                backgroundColor: isActiveItem ? 'rgba(255,255,255,0.12)' : highlight ? 'rgba(252, 211, 77, 0.16)' : 'transparent',
                                border: highlight ? '1px solid rgba(252, 211, 77, 0.3)' : 'none',
                                transition: 'all 0.2s',
                                overflow: 'hidden'
                              }}>
                              <span className="material-symbols-rounded" style={{ fontSize: '1.1rem', flexShrink: 0, color: highlight ? '#facc15' : 'inherit' }}>{item.icon}</span>
                              <span style={{ marginLeft: '0.85rem', opacity: isExpanded ? 1 : 0, whiteSpace: 'nowrap' }}>{item.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </nav>

      <div style={{ padding: '1rem 0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0b7a6f', overflow: 'hidden' }}>
        <button onClick={() => logoutAction()} style={{ background: 'none', border: 'none', padding: '0.75rem', cursor: 'pointer', color: '#ffb3b3', width: '100%', display: 'flex', alignItems: 'center', fontWeight: '700', fontSize: '0.85rem', borderRadius: '10px' }}>
          <span className="material-symbols-rounded" style={{ flexShrink: 0, width: '24px', textAlign: 'center' }}>logout</span>
          <span style={{ marginLeft: '0.75rem', opacity: isExpanded ? 1 : 0, width: isExpanded ? '100%' : '0', visibility: isExpanded ? 'visible' : 'hidden' }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}