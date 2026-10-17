import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';
import type { UserRole } from '@/types/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, role } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName?.trim() || cleanEmail.split('@')[0] || 'Player';
    const cleanPhone = phone?.trim() || null;
    const cleanRole: UserRole = role === 'owner' ? 'owner' : role === 'admin' ? 'admin' : 'player';

    const supabaseAdmin = getServiceRoleClient();

    // Check if user already exists in auth.users
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    let userId: string;

    if (existingAuthUser) {
      // User exists (e.g. from prior OTP attempt) - update password & confirm email
      userId = existingAuthUser.id;
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: {
          full_name: cleanName,
          phone: cleanPhone,
          role: cleanRole,
        },
      });

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 400 });
      }
    } else {
      // Create fresh user with email pre-confirmed (bypasses Supabase 3-email-per-hour rate limit)
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: cleanName,
          phone: cleanPhone,
          role: cleanRole,
        },
      });

      if (createError || !newUser?.user) {
        return NextResponse.json({ success: false, error: createError?.message || 'Failed to create user' }, { status: 400 });
      }

      userId = newUser.user.id;
    }

    // Upsert into public.profiles
    const { error: profileError } = await (supabaseAdmin.from('profiles') as any).upsert({
      id: userId,
      email: cleanEmail,
      name: cleanName,
      phone: cleanPhone,
      role: cleanRole,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile upsert warning:', profileError);
    }

    return NextResponse.json({ success: true, userId });
  } catch (err: any) {
    console.error('Error in /api/auth/register:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
