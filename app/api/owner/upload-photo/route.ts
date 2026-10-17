import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No photo file provided' }, { status: 400 });
    }

    // Verify file size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File exceeds 8MB limit' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanFileName = `turf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
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
  } catch (err: any) {
    console.error('Photo upload handler error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
