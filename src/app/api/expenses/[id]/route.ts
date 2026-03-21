import { type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      expense_heads ( name ),
      buses ( vehicle_no )
    `)
    .eq('id', id)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 });
  }

  const result = {
    ...data,
    head_name: data.expense_heads?.name ?? null,
    vehicle_no: data.buses?.vehicle_no ?? null,
    expense_heads: undefined,
    buses: undefined,
  };

  return Response.json(result);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServiceClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('expenses')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
