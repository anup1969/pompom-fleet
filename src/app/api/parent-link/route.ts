import { type NextRequest } from 'next/server';

/**
 * GET /api/parent-link?tenant_id=xxx
 *
 * Returns the public parent admission form URL for the given tenant.
 * The URL is deterministic — based on tenant_id, no token table needed.
 */
export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get('tenant_id');

  if (!tenantId) {
    return Response.json({ error: 'tenant_id is required' }, { status: 400 });
  }

  // Build the public URL from the request origin
  const origin = request.nextUrl.origin;
  const url = `${origin}/parent-form?t=${tenantId}`;

  return Response.json({ url });
}
