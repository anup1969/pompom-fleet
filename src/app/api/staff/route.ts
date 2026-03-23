import { type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const tenantId = request.nextUrl.searchParams.get('tenant_id');

  if (!tenantId) {
    return Response.json({ error: 'tenant_id is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  if (!body.name || !body.tenant_id) {
    return Response.json(
      { error: 'name and tenant_id are required' },
      { status: 400 },
    );
  }

  // Strip any unknown fields that could cause Supabase errors
  const allowed = [
    'tenant_id', 'name', 'role', 'father_name', 'dob', 'phone',
    'aadhar', 'license_no', 'license_expiry', 'police_verification',
    'salary', 'assigned_bus_id', 'status', 'custom_fields',
  ];
  const clean: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) clean[key] = body[key];
  }

  const { data, error } = await supabase
    .from('staff')
    .insert(clean)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
