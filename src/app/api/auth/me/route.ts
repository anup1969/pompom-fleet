import { cookies } from 'next/headers';
import { validateSession } from '@/lib/auth';

/**
 * GET /api/auth/me
 *
 * Returns current user + tenant info from session cookie.
 * Used by SessionProvider on the client side.
 */
export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('fleet_session');

  if (!sessionCookie?.value) {
    return Response.json({ user: null, tenant: null }, { status: 401 });
  }

  const session = await validateSession(sessionCookie.value);

  if (!session) {
    return Response.json({ user: null, tenant: null }, { status: 401 });
  }

  return Response.json({
    user: {
      id: session.user.id,
      name: session.user.name,
      role: session.user.role,
      email: session.user.email,
    },
    tenant: {
      id: session.tenant.id,
      client_id: session.tenant.client_id,
      client_name: session.tenant.client_name,
    },
  });
}
