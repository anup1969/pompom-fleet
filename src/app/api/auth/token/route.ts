import { type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import {
  validatePomPomToken,
  getOrCreateTenant,
  getOrCreateUser,
  createSession,
} from '@/lib/auth';

/**
 * GET /api/auth/token?token=xyz
 *
 * PomPom JWT handoff endpoint.
 * Validates the JWT, creates tenant + user if needed,
 * creates a session, sets cookie, and redirects to dashboard.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'missing_token');
    return Response.redirect(loginUrl.toString());
  }

  try {
    // 1. Validate JWT
    const payload = validatePomPomToken(token);

    // 2. Get or create tenant
    const tenant = await getOrCreateTenant(
      payload.client_id,
      payload.client_name || payload.client_id
    );

    // 3. Get or create user
    const user = await getOrCreateUser(
      tenant.id,
      payload.user_id,
      payload.user_name,
      payload.user_role
    );

    // 4. Create session
    const sessionToken = await createSession(user.id, tenant.id);

    // 5. Set cookie
    const cookieStore = await cookies();
    cookieStore.set('fleet_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    // 6. Redirect to dashboard
    const dashboardUrl = new URL('/', request.url);
    return Response.redirect(dashboardUrl.toString());
  } catch (err) {
    console.error('Token validation failed:', err);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set(
      'error',
      err instanceof Error ? err.message : 'invalid_token'
    );
    return Response.redirect(loginUrl.toString());
  }
}
