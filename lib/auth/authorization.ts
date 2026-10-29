import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types/database';

export interface RequestIdentity {
  user: { id: string; email?: string };
  role: UserRole;
}

/** Read identity from the verified Supabase session and role from profiles only. */
export async function getRequestIdentity(): Promise<RequestIdentity | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;

    const profileResult = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();
    const profile = profileResult.data as unknown as { role: UserRole } | null;

    // Fail closed: missing/unavailable profile never inherits metadata privileges.
    const role: UserRole = profileResult.error ? 'player' : (profile?.role ?? 'player');
    return { user: data.user, role };
  } catch {
    return null;
  }
}

export function hasAnyRole(role: UserRole, allowed: readonly UserRole[]): boolean {
  return allowed.includes(role);
}
