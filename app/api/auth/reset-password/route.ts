import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
    }

    const body = await request.json();
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
    if (newPassword.length < 8 || newPassword.length > 128) {
      return NextResponse.json({ success: false, error: 'Password must be 8–128 characters.' }, { status: 400 });
    }

    // Update only the account represented by the verified session; no email lookup
    // or service-role password reset is exposed by this endpoint.
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return NextResponse.json({ success: false, error: 'Unable to update password.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Password updated.' });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to update password.' }, { status: 500 });
  }
}
