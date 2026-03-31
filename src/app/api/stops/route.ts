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
    .select('*, stop_areas(id, area_id, areas(id, name))')
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true });

  if (routeId) {
    query = query.eq('route_id', routeId);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Flatten areas for each stop
  const result = (data ?? []).map((s: Record<string, unknown>) => {
    const stopAreas = Array.isArray(s.stop_areas) ? s.stop_areas : [];
    const areas = stopAreas.map((sa: Record<string, unknown>) => {
      const areaObj = sa.areas as Record<string, unknown> | null;
      return {
        id: sa.area_id,
        name: areaObj ? areaObj.name : null,
        stop_area_id: sa.id,
      };
    });
    return {
      ...s,
      yearly_fee: s.yearly_fee ?? null,
      areas,
      stop_areas: undefined,
    };
  });

  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  // route_id is now optional — stops are independent
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
