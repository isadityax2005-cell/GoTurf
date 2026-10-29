import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getRequestIdentity } from '@/lib/auth/authorization';
import { getServiceRoleClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const identity = await getRequestIdentity();
    if (!identity) return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
    if (identity.role !== 'owner') return NextResponse.json({ success: false, error: 'Verified owner access required.' }, { status: 403 });

    const formData = await request.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No photo file provided' }, { status: 400 });
    }

    if (file.size === 0 || file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Photo must be between 1 byte and 8MB.' }, { status: 400 });
    }

    const allowedTypes: Record<string, { extension: string; valid: (buffer: Buffer) => boolean }> = {
      'image/jpeg': { extension: 'jpg', valid: (buffer) => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff },
      'image/png': { extension: 'png', valid: (buffer) => buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
      'image/webp': { extension: 'webp', valid: (buffer) => buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP' },
    };
    const fileType = allowedTypes[file.type];
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!fileType || !fileType.valid(buffer)) {
      return NextResponse.json({ success: false, error: 'Upload a valid JPEG, PNG, or WebP image.' }, { status: 400 });
    }

    const cleanFileName = `turf_${randomUUID()}.${fileType.extension}`;
    const filePath = `uploads/${cleanFileName}`;

    const supabaseAdmin = getServiceRoleClient();

    const { data, error } = await supabaseAdmin.storage
      .from('turf-photos')
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('turf-photos')
      .getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      path: data.path,
    });
  } catch (err: unknown) {
    console.error('Photo upload handler error:', err);
    const message = err instanceof Error ? err.message : 'Failed to upload photo';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
