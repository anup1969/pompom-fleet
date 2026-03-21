import { type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { authenticateByEmail, createSession } from '@/lib/auth';

/**
 * POST /api/auth/login
 *
 * Standalone login endpoint for contractors without PomPom.
 * Accepts { email, password } and returns a session cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate
    const user = await authenticateByEmail(email, password);

    if (!user) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = await createSession(user.id, user.tenant_id);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('fleet_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return Response.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
