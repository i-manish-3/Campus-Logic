'use server';

import prisma from '@/lib/prisma';
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user || !user.isActive) {
      return { error: 'Invalid email or password.' };
    }

    if (user.isSuperAdmin) {
      const hash = hashPassword(password);
      if (hash !== user.passwordHash) {
        return { error: 'Invalid email or password.' };
      }

      const token = await signSession({
        userId: user.id,
        tenantId: 'superadmin',
        email: user.email,
        name: `${user.firstName} ${user.lastName ?? ''}`.trim(),
        isSuperAdmin: true,
      });

      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
      });

      return { success: true, redirectUrl: '/superadmin' };
    }

    if (!user.tenant || !user.tenant.isActive) {
      return { error: 'Your school account has been suspended. Contact support.' };
    }

    const hash = hashPassword(password);
    if (hash !== user.passwordHash) {
      return { error: 'Invalid email or password.' };
    }

    // Create signed session
    const token = await signSession({
      userId: user.id,
      tenantId: user.tenantId!,
      tenantDomain: user.tenant.domain ?? undefined,
      email: user.email,
      name: `${user.firstName} ${user.lastName ?? ''}`.trim(),
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return { success: true, redirectUrl: `/school/${user.tenant.domain || user.tenantId!}` };
  } catch (err) {
    console.error(err);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect('/login');
}
