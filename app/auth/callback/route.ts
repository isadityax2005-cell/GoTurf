import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServiceRoleClient } from '@/lib/supabase';
import type { UserRole } from '@/types/database';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      const user = data.user;
      const meta = user.user_metadata || {};
      const supabaseAdmin = getServiceRoleClient();

      // Ensure profile exists in public.profiles
      const { data: existingData } = await (supabaseAdmin.from('profiles') as any)
        .select('role')
        .eq('id', user.id)
        .single();

      const existing = existingData as { role?: UserRole } | null;
      const userRole: UserRole = existing?.role ? (existing.role as UserRole) : (meta.role as UserRole) || 'player';

      await (supabaseAdmin.from('profiles') as any)
        .upsert({
          id: user.id,
          email: user.email?.toLowerCase().trim() || '',
          name: meta.full_name || meta.name || user.email?.split('@')[0] || 'Player',
          phone: meta.phone || null,
          role: userRole,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      // Determine smart destination
      let destination = next;
      if (!destination || destination === '/') {
        if (userRole === 'admin') destination = '/admin';
        else if (userRole === 'owner') destination = '/owner';
        else destination = '/turfs';
      }

      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // Return the user to login with error query param
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
