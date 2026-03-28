import { type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const tenantId = request.nextUrl.searchParams.get('tenant_id');
  const routeId = request.nextUrl.searchParams.get('route_id');

  if (!tenantId) {
    return Response.json({ error: 'tenant_id is required' }, { status: 400 });
  }

  let query = supabase
    .from('stops')
    .select('*, routes(name)')
    .eq('tenant_id', tenantId)
    .order('sequence_order', { ascending: true });

  if (routeId) {
    query = query.eq('route_id', routeId);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Flatten route name
  const result = (data ?? []).map((s: Record<string, unknown>) => ({
    ...s,
    route_name: s.routes && typeof s.routes === 'object' ? (s.routes as Record<string, unknown>).name : null,
    routes: undefined,
  }));

  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('stops')
    .insert(body)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
