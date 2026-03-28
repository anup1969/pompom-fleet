import { type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const tenantId = request.nextUrl.searchParams.get('tenant_id');

  if (!tenantId) {
    return Response.json({ error: 'tenant_id is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('admissions')
    .select('*, routes(name), stops(name)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Flatten route_name and stop_name
  const result = (data ?? []).map((a: Record<string, unknown>) => ({
    ...a,
    route_name: a.routes && typeof a.routes === 'object' ? (a.routes as Record<string, unknown>).name : null,
    stop_name: a.stops && typeof a.stops === 'object' ? (a.stops as Record<string, unknown>).name : null,
    routes: undefined,
    stops: undefined,
  }));

  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('admissions')
    .insert(body)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
