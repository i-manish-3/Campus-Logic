import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Metadata } from 'next';
import { getSession } from '@/lib/session';

export async function generateMetadata({ params }: { params: Promise<{ tenantId: string }> }): Promise<Metadata> {
  const { tenantId } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { domain: tenantId }
  }) || await prisma.tenant.findUnique({
    where: { id: tenantId }
  });

  const schoolName = tenant?.name || 'School Portal';
  return {
    title: `${schoolName} | My Digital Academy`,
    description: `Official management portal for ${schoolName}`,
  };
}

export default async function SchoolLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;

  let tenant = await prisma.tenant.findUnique({
    where: { domain: tenantId }
  }) || await prisma.tenant.findUnique({
    where: { id: tenantId }
  });

  if (!tenant && tenantId !== 'demo-school') {
    notFound();
  }

  const schoolName = tenant?.name || 'Demo International School';
  const logoUrl = tenant?.logoUrl || null;
  const actualTenantId = tenant ? tenant.id : 'demo-school';

  // Role-based Permissions for Sidebar
  const session = await getSession();
  let sidebarPermissions: string[] = [];

  if (session) {
    if (session.isSuperAdmin) {
      sidebarPermissions = ['*'];
    } else {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      });
      sidebarPermissions = user?.role?.permissions.map(p => p.permission.action) || [];
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
      <Sidebar 
        tenantId={tenantId} 
        schoolName={schoolName} 
        logoUrl={logoUrl} 
        permissions={sidebarPermissions}
      />
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}
