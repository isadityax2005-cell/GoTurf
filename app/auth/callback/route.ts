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
      const profileResult = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      const existing = profileResult.data as unknown as { role: UserRole } | null;

      // Roles come only from the profile table. Metadata is user-editable.
      let userRole: UserRole = profileResult.error ? 'player' : (existing?.role ?? 'player');
      if (!existing) {
        const admin = getServiceRoleClient();
        await admin.from('profiles').upsert({
          id: user.id,
          email: user.email?.toLowerCase().trim() || '',
          name: meta.full_name || meta.name || user.email?.split('@')[0] || 'Player',
          phone: meta.phone || null,
          role: 'player',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
        userRole = 'player';
      }

      const safeNext = getSafeLocalPath(next, origin);
      const destination = safeNext && safeNext !== '/'
        ? safeNext
        : (userRole === 'admin' ? '/admin' : userRole === 'owner' ? '/owner' : '/turfs');
      return NextResponse.redirect(new URL(destination, origin));
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', origin));
}

function getSafeLocalPath(value: string | null, origin: string): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null;
  try {
    const url = new URL(value, origin);
    return url.origin === origin ? `${url.pathname}${url.search}${url.hash}` : null;
  } catch {
    return null;
  }
}
