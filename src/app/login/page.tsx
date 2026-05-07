import { Suspense } from 'react';
import LoginForm from './LoginForm';
import prisma from '@/lib/prisma';

export default async function LoginPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ next?: string, error?: string }> 
}) {
  const params = await searchParams;
  const nextPath = params.next || '';
  
  let tenant = null;
  if (nextPath.startsWith('/school/')) {
    // Extract tenantId/domain from path like /school/[tenantId]/...
    const parts = nextPath.split('/');
    if (parts.length >= 3) {
      const slug = parts[2];
      tenant = await prisma.tenant.findUnique({ where: { domain: slug } }) || 
               await prisma.tenant.findUnique({ where: { id: slug } });
    }
  }

  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050a15', color: 'white' }}>
        Loading portal…
      </div>
    }>
      <LoginForm 
        tenantName={tenant?.name} 
        tenantLogo={tenant?.logoUrl} 
      />
    </Suspense>
  );
}
