import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getServiceRoleClient();
    const cleanEmail = email.trim().toLowerCase();

    // Find user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ success: false, error: listError.message }, { status: 500 });
    }

    const targetUser = users.users.find((u) => u.email?.toLowerCase() === cleanEmail);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: `No user found with email ${cleanEmail}` },
        { status: 404 }
      );
    }

    // Update password
    const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
      {
        password: newPassword,
        email_confirm: true,
      }
    );

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Password successfully updated for ${cleanEmail}! You can now sign in with your new password.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
