import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim().slice(0, 100) : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 40) : '';

    if (!email || !password || !fullName || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email, password, and name are required.' }, { status: 400 });
    }
    if (password.length < 8 || password.length > 128) {
      return NextResponse.json({ success: false, error: 'Password must be 8–128 characters.' }, { status: 400 });
    }

    // Public signup uses the anon/session client. Never use the service role to
    // set passwords, confirm addresses, overwrite existing accounts, or assign roles.
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone: phone || null } },
    });

    if (error || !data.user) {
      // Keep responses generic to avoid exposing whether an address is registered.
      return NextResponse.json({ success: false, error: 'Unable to create account. Check the information and try again.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      needsEmailConfirmation: !data.session,
      role: 'player',
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to create account right now.' }, { status: 500 });
  }
}
