import { type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const tenantId = request.nextUrl.searchParams.get('tenant_id');

  if (!tenantId) {
    return Response.json({ error: 'tenant_id is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      expense_heads ( name ),
      buses ( vehicle_no )
    `)
    .eq('tenant_id', tenantId)
    .order('expense_date', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Flatten the joined fields
  const results = (data ?? []).map((row) => ({
    ...row,
    head_name: row.expense_heads?.name ?? null,
    vehicle_no: row.buses?.vehicle_no ?? null,
    expense_heads: undefined,
    buses: undefined,
  }));

  return Response.json(results);
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('expenses')
    .insert(body)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
