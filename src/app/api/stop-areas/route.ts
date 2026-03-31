import { type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const stopId = request.nextUrl.searchParams.get('stop_id');
  const areaId = request.nextUrl.searchParams.get('area_id');

  let query = supabase
    .from('stop_areas')
    .select('*, stops(id, name), areas(id, name)')
    .order('id', { ascending: true });

  if (stopId) {
    query = query.eq('stop_id', stopId);
  }

  if (areaId) {
    query = query.eq('area_id', areaId);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Flatten names
  const result = (data ?? []).map((sa: Record<string, unknown>) => ({
    id: sa.id,
    stop_id: sa.stop_id,
    area_id: sa.area_id,
    stop_name: sa.stops && typeof sa.stops === 'object' ? (sa.stops as Record<string, unknown>).name : null,
    area_name: sa.areas && typeof sa.areas === 'object' ? (sa.areas as Record<string, unknown>).name : null,
  }));

  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('stop_areas')
    .insert(body)
    .select('*, stops(id, name), areas(id, name)')
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const result = {
    id: data.id,
    stop_id: data.stop_id,
    area_id: data.area_id,
    stop_name: data.stops && typeof data.stops === 'object' ? (data.stops as Record<string, unknown>).name : null,
    area_name: data.areas && typeof data.areas === 'object' ? (data.areas as Record<string, unknown>).name : null,
  };

  return Response.json(result, { status: 201 });
}
