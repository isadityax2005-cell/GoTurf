'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function MaggieNavbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; name?: string; role?: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          // Fetch authoritative role from public.profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, role, phone')
            .eq('id', authData.user.id)
            .maybeSingle<{ name?: string; role?: string; phone?: string | null }>();

          const role = profile?.role || 'player';
          const name = profile?.name || authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'User';

          setUser({
            email: authData.user.email,
            name,
            role,
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Navbar user load error:', err);
      }
    }

    loadUserProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, role, phone')
          .eq('id', session.user.id)
          .maybeSingle<{ name?: string; role?: string; phone?: string | null }>();

        const role = profile?.role || 'player';
        const name = profile?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';

        setUser({
          email: session.user.email,
          name,
          role,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-[#82eda6]/90 backdrop-blur-md border-b-2 border-[#03594d] px-4 sm:px-6 py-3.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="h-9 w-9 rounded-full bg-[#03594d] text-[#82eda6] flex items-center justify-center font-black text-sm shadow-maggie-sm group-hover:rotate-6 transition-transform">
            GT
          </div>
          <span className="font-black text-2xl tracking-tight text-[#03594d] lowercase">
            goturf
          </span>
          <span className="hidden xs:inline-block text-[10px] font-black uppercase tracking-wider bg-[#ffff94] text-[#03594d] px-2.5 py-0.5 rounded-full border border-[#03594d] shadow-maggie-sm">
            mumbai
          </span>
        </Link>

        {/* Center Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-black tracking-wider uppercase text-[#03594d]">
          <Link href="/turfs" className="hover:underline underline-offset-4 transition-all">
            Venues
          </Link>
          <Link href="/owner" className="hover:underline underline-offset-4 transition-all">
            Add Venue
          </Link>
          <Link href="/bookings" className="hover:underline underline-offset-4 transition-all">
            My Passes
          </Link>
          <Link href="/contact" className="hover:underline underline-offset-4 transition-all">
            Contact
          </Link>
        </nav>

        {/* Action Buttons & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Role specific quick badge */}
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="px-3 py-1 text-[11px] font-black uppercase tracking-wider bg-[#03594d] text-[#82eda6] rounded-full border-2 border-[#03594d] shadow-maggie-sm hover:bg-[#02463c] transition-all"
                  title="Open Admin Control Suite"
                >
                  ⚡ Admin Suite
                </Link>
              )}
              {user.role === 'owner' && (
                <Link
                  href="/owner"
                  className="px-3 py-1 text-[11px] font-black uppercase tracking-wider bg-[#ffff94] text-[#03594d] rounded-full border-2 border-[#03594d] shadow-maggie-sm hover:bg-white transition-all"
                  title="Open Turf Owner Dashboard"
                >
                  🏟️ Owner Portal
                </Link>
              )}

              <span className="hidden sm:inline-block text-xs font-black text-[#03594d] bg-[#ffff94] px-3 py-1 rounded-full border border-[#03594d] shadow-maggie-sm">
                👤 {user.name}
              </span>

              <button
                onClick={handleSignOut}
                className="text-xs font-black uppercase text-[#03594d] px-2.5 py-1.5 hover:underline underline-offset-4 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-black uppercase text-[#03594d] px-3 py-1.5 rounded-full border-2 border-[#03594d] bg-white hover:bg-[#ffff94] shadow-maggie-sm transition-all"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/turfs"
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black tracking-wider uppercase border-2 border-[#03594d] shadow-maggie hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-maggie-lg transition-all shrink-0"
          >
            Book a Turf
          </Link>
        </div>
      </div>
    </header>
  );
}
