import { type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const tenantId = request.nextUrl.searchParams.get('tenant_id');

  if (!tenantId) {
    return Response.json({ error: 'tenant_id is required' }, { status: 400 });
  }

  // Join pickup route/stop and drop route/stop by using aliases via separate queries
  // Supabase JS client doesn't support alias joins, so we fetch admissions + lookup tables
  const { data, error } = await supabase
    .from('admissions')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return Response.json([]);
  }

  // Collect unique route/stop IDs to look up names
  const routeIds = new Set<string>();
  const stopIds = new Set<string>();
  for (const a of data) {
    if (a.pickup_route_id) routeIds.add(a.pickup_route_id);
    if (a.drop_route_id) routeIds.add(a.drop_route_id);
    if (a.route_id) routeIds.add(a.route_id);
    if (a.pickup_stop_id) stopIds.add(a.pickup_stop_id);
    if (a.drop_stop_id) stopIds.add(a.drop_stop_id);
    if (a.stop_id) stopIds.add(a.stop_id);
  }

  // Fetch route names
  const routeMap: Record<string, string> = {};
  if (routeIds.size > 0) {
    const { data: routes } = await supabase
      .from('routes')
      .select('id, name')
      .in('id', Array.from(routeIds));
    if (routes) {
      for (const r of routes) routeMap[r.id] = r.name;
    }
  }

  // Fetch stop names
  const stopMap: Record<string, string> = {};
  if (stopIds.size > 0) {
    const { data: stops } = await supabase
      .from('stops')
      .select('id, name')
      .in('id', Array.from(stopIds));
    if (stops) {
      for (const s of stops) stopMap[s.id] = s.name;
    }
  }

  // Flatten
  const result = data.map((a: any) => ({
    ...a,
    route_name: a.route_id ? routeMap[a.route_id] || null : null,
    stop_name: a.stop_id ? stopMap[a.stop_id] || null : null,
    pickup_route_name: a.pickup_route_id ? routeMap[a.pickup_route_id] || null : null,
    pickup_stop_name: a.pickup_stop_id ? stopMap[a.pickup_stop_id] || null : null,
    drop_route_name: a.drop_route_id ? routeMap[a.drop_route_id] || null : null,
    drop_stop_name: a.drop_stop_id ? stopMap[a.drop_stop_id] || null : null,
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
