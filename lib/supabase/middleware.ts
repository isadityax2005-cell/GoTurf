import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database, UserRole } from '@/types/database';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isOwnerRoute = pathname.startsWith('/owner');
  const isAdminRoute = pathname.startsWith('/admin');
  const isPlayerProtectedRoute = pathname.startsWith('/bookings') || pathname.startsWith('/profile');

  if (isOwnerRoute || isAdminRoute || isPlayerProtectedRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    if (isOwnerRoute || isAdminRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const userRole = ((profile as unknown as { role?: UserRole } | null)?.role as UserRole) || 'player';

      if (isAdminRoute && userRole !== 'admin') {
        const url = request.nextUrl.clone();
        url.pathname = '/unauthorized';
        url.searchParams.set('reason', 'admin_required');
        return NextResponse.redirect(url);
      }

      if (isOwnerRoute && userRole !== 'owner' && userRole !== 'admin') {
        const url = request.nextUrl.clone();
        url.pathname = '/unauthorized';
        url.searchParams.set('reason', 'owner_required');
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
