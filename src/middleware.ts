import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /school/* and /superadmin routes
  if (!pathname.startsWith('/school/') && !pathname.startsWith('/superadmin')) {
    return NextResponse.next();
  }

  // Skip the demo school (no auth required for demo)
  if (pathname.startsWith('/school/demo-school')) {
    return NextResponse.next();
  }

  // Extract tenantId from path: /school/[tenantId]/...
  const parts = pathname.split('/'); // ['', 'school', 'tenantId', ...]
  const tenantId = parts[2];

  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;

  if (!sessionCookie) {
    // Not logged in — redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await verifySession(sessionCookie);

  if (!session) {
    // Tampered or invalid cookie
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  // Handle Super Admin routes
  if (pathname.startsWith('/superadmin')) {
    if (!session.isSuperAdmin) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // For /school/* routes, verify they are NOT a super admin
  if (session.isSuperAdmin) {
    return NextResponse.redirect(new URL('/superadmin', request.url));
  }

  // Check that this user belongs to this tenant
  // The tenantId in the URL could be the tenant's UUID or its domain slug.
  // We allow access if the session's tenantId matches either.
  if (session.tenantId !== tenantId && session.tenantDomain !== tenantId) {
    // They're logged in, but for a different school
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    loginUrl.searchParams.set('error', 'wrong_school');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/school/:path*', '/superadmin/:path*', '/superadmin'],
};
