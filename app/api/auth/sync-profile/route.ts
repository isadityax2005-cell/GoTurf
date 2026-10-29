import { NextResponse } from 'next/server';
import { getRequestIdentity } from '@/lib/auth/authorization';
import { getServiceRoleClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const identity = await getRequestIdentity();
    if (!identity) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : undefined;
    const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 40) : undefined;
    const email = identity.user.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ success: false, error: 'A verified account email is required.' }, { status: 400 });
    }

    const admin = getServiceRoleClient();
    const { data: existing, error: lookupError } = await admin
      .from('profiles')
      .select('id')
      .eq('id', identity.user.id)
      .maybeSingle();
    if (lookupError) throw lookupError;

    const profileFields = {
      email,
      ...(name ? { name } : {}),
      ...(phone !== undefined ? { phone: phone || null } : {}),
      updated_at: new Date().toISOString(),
    };

    const result = existing
      ? await admin.from('profiles').update(profileFields).eq('id', identity.user.id).select('id, email, name, phone, role').single()
      : await admin.from('profiles').insert({
          id: identity.user.id,
          ...profileFields,
          name: name || splitEmailName(email),
          role: 'player',
        }).select('id, email, name, phone, role').single();

    if (result.error) {
      return NextResponse.json({ success: false, error: 'Unable to update profile.' }, { status: 500 });
    }
    return NextResponse.json({ success: true, profile: result.data });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to update profile.' }, { status: 500 });
  }
}

function splitEmailName(email: string): string {
  const prefix = email.split('@')[0] || 'Player';
  return prefix.replace(/[._-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
