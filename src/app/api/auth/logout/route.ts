import { cookies } from 'next/headers';
import { destroySession } from '@/lib/auth';

/**
 * POST /api/auth/logout
 *
 * Destroy session and clear cookie.
 * Redirects to /login.
 */
export async function POST() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('fleet_session');

  if (sessionCookie?.value) {
    await destroySession(sessionCookie.value);
  }

  // Clear the cookie
  cookieStore.set('fleet_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return Response.json({ success: true, redirect: '/login' });
}
