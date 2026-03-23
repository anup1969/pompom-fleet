import { type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

const BUCKET = 'documents';
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const ownerType = formData.get('owner_type') as string | null;
  const ownerId = formData.get('owner_id') as string | null;
  const docType = formData.get('doc_type') as string | null;
  const tenantId = formData.get('tenant_id') as string | null;

  if (!file || !ownerType || !ownerId || !docType || !tenantId) {
    return Response.json(
      { error: 'Missing required fields: file, owner_type, owner_id, doc_type, tenant_id' },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return Response.json({ error: 'File exceeds 5 MB limit' }, { status: 400 });
  }

  // Build a unique storage path
  const ext = file.name.split('.').pop() || 'bin';
  const storagePath = `${tenantId}/${ownerType}/${ownerId}/${docType}-${Date.now()}.${ext}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return Response.json({ error: uploadError.message }, { status: 500 });
  }

  // Get the public URL
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  const fileUrl = urlData.publicUrl;

  // Save a record in the documents table
  const { data, error: dbError } = await supabase
    .from('documents')
    .insert({
      tenant_id: tenantId,
      owner_type: ownerType,
      owner_id: ownerId,
      doc_type: docType,
      file_url: fileUrl,
      status: 'active',
    })
    .select()
    .single();

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
