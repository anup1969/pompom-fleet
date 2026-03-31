import { type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * GET /api/parent-link?tenant_id=xxx
 *
 * Returns the public parent admission form URL and tenant name.
 */
export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get('tenant_id');

  if (!tenantId) {
    return Response.json({ error: 'tenant_id is required' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: tenant } = await supabase
    .from('tenants')
    .select('client_name')
    .eq('id', tenantId)
    .single();

  const origin = request.nextUrl.origin;
  const url = `${origin}/parent-form?t=${tenantId}`;

  return Response.json({
    url,
    tenant_name: tenant?.client_name || '',
  });
}
