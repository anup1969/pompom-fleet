import { type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/* eslint-disable @typescript-eslint/no-explicit-any */

const ADMIN_KEY = 'pompom2026';

export async function GET(request: NextRequest) {
  // Simple key-based auth
  const key = request.nextUrl.searchParams.get('key');
  if (key !== ADMIN_KEY) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Optional filters
  const tenantId = request.nextUrl.searchParams.get('tenant_id');
  const classGrade = request.nextUrl.searchParams.get('class_grade');
  const areaName = request.nextUrl.searchParams.get('area_name');
  const searchQ = request.nextUrl.searchParams.get('search');
  const fromDate = request.nextUrl.searchParams.get('from_date');
  const toDate = request.nextUrl.searchParams.get('to_date');

  // Build query
  let query = supabase
    .from('admissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }
  if (classGrade) {
    query = query.eq('class_grade', classGrade);
  }
  if (areaName) {
    query = query.ilike('area_name', `%${areaName}%`);
  }
  if (searchQ) {
    query = query.or(
      `student_name.ilike.%${searchQ}%,father_name.ilike.%${searchQ}%,grn.ilike.%${searchQ}%,primary_mobile.ilike.%${searchQ}%`
    );
  }
  if (fromDate) {
    query = query.gte('created_at', `${fromDate}T00:00:00`);
  }
  if (toDate) {
    query = query.lte('created_at', `${toDate}T23:59:59`);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    // Still fetch tenants for the dropdown
    const { data: tenants } = await supabase
      .from('tenants')
      .select('id, client_name')
      .order('client_name');
    return Response.json({ admissions: [], tenants: tenants || [] });
  }

  // Collect unique tenant IDs, route IDs, stop IDs
  const tenantIds = new Set<string>();
  const routeIds = new Set<string>();
  const stopIds = new Set<string>();

  for (const a of data) {
    if (a.tenant_id) tenantIds.add(a.tenant_id);
    if (a.pickup_route_id) routeIds.add(a.pickup_route_id);
    if (a.drop_route_id) routeIds.add(a.drop_route_id);
    if (a.route_id) routeIds.add(a.route_id);
    if (a.pickup_stop_id) stopIds.add(a.pickup_stop_id);
    if (a.drop_stop_id) stopIds.add(a.drop_stop_id);
    if (a.stop_id) stopIds.add(a.stop_id);
  }

  // Fetch tenant names
  const tenantMap: Record<string, string> = {};
  if (tenantIds.size > 0) {
    const { data: tenants } = await supabase
      .from('tenants')
      .select('id, client_name')
      .in('id', Array.from(tenantIds));
    if (tenants) {
      for (const t of tenants) tenantMap[t.id] = t.client_name;
    }
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

  // Flatten with names
  const admissions = data.map((a: any) => ({
    ...a,
    client_name: a.tenant_id ? tenantMap[a.tenant_id] || 'Unknown' : 'Unknown',
    route_name: a.route_id ? routeMap[a.route_id] || null : null,
    stop_name: a.stop_id ? stopMap[a.stop_id] || null : null,
    pickup_route_name: a.pickup_route_id ? routeMap[a.pickup_route_id] || null : null,
    pickup_stop_name: a.pickup_stop_id ? stopMap[a.pickup_stop_id] || null : null,
    drop_route_name: a.drop_route_id ? routeMap[a.drop_route_id] || null : null,
    drop_stop_name: a.drop_stop_id ? stopMap[a.drop_stop_id] || null : null,
  }));

  // Fetch all tenants for dropdown
  const { data: allTenants } = await supabase
    .from('tenants')
    .select('id, client_name')
    .order('client_name');

  return Response.json({
    admissions,
    tenants: allTenants || [],
  });
}
