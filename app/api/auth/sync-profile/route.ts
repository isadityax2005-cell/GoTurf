import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';
import type { UserRole } from '@/types/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, name, phone, role } = body;

    if (!userId || !email) {
      return NextResponse.json({ success: false, error: 'Missing userId or email' }, { status: 400 });
    }

    const supabaseAdmin = getServiceRoleClient();

    // Check if profile already exists to preserve established roles (like admin)
    const { data: existingData } = await (supabaseAdmin.from('profiles') as any)
      .select('id, role, name, phone')
      .eq('id', userId)
      .single();

    const existing = existingData as { id: string; role?: UserRole; name?: string; phone?: string | null } | null;

    const targetRole: UserRole = existing?.role ? (existing.role as UserRole) : (role as UserRole) || 'player';
    const targetName = name || existing?.name || splitEmailName(email);
    const targetPhone = phone || existing?.phone || null;

    const { data, error } = await (supabaseAdmin.from('profiles') as any)
      .upsert({
        id: userId,
        email: email.toLowerCase().trim(),
        name: targetName,
        phone: targetPhone,
        role: targetRole,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Failed to sync profile:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (err: any) {
    console.error('Error in sync-profile:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

function splitEmailName(email: string): string {
  const prefix = email.split('@')[0] || 'Player';
  return prefix
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
