import { type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const tenantId = request.nextUrl.searchParams.get('tenant_id');
  const date = request.nextUrl.searchParams.get('date');

  if (!tenantId) {
    return Response.json({ error: 'tenant_id is required' }, { status: 400 });
  }

  let query = supabase
    .from('attendance')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('date', { ascending: false });

  if (date) {
    query = query.eq('date', date);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  // Expects: { tenant_id, date, marked_by, records: [{ staff_id, status, remark }] }
  const { tenant_id, date, marked_by, records } = body;

  if (!tenant_id || !date || !Array.isArray(records)) {
    return Response.json(
      { error: 'tenant_id, date, and records[] are required' },
      { status: 400 }
    );
  }

  const rows = records.map((r: { staff_id: string; status: string; remark?: string }) => ({
    tenant_id,
    staff_id: r.staff_id,
    date,
    status: r.status,
    remark: r.remark ?? null,
    marked_by: marked_by ?? null,
  }));

  const { data, error } = await supabase
    .from('attendance')
    .upsert(rows, { onConflict: 'tenant_id,staff_id,date' })
    .select();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
