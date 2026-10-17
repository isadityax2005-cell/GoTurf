'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types/database';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const errorParam = searchParams.get('error');

  // Primary Mode: 'signin' or 'signup'
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Sign In Method: 'password' (default) or 'otp'
  const [signInWithOtp, setSignInWithOtp] = useState(false);

  // Form Fields
  const [role, setRole] = useState<UserRole>('player');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Flow State
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam === 'auth_failed' ? 'Login link was invalid or expired. Please sign in below.' : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  const determineRedirect = (targetRole: UserRole) => {
    if (redirectParam) return redirectParam;
    if (targetRole === 'admin') return '/admin';
    if (targetRole === 'owner') return '/owner';
    return '/turfs';
  };

  // Helper to sync profile details
  const syncProfile = async (userId: string, userEmail: string, chosenRole: UserRole) => {
    try {
      await fetch('/api/auth/sync-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email: userEmail,
          name: fullName || undefined,
          phone: phone || undefined,
          role: chosenRole,
        }),
      });
    } catch (e) {
      console.error('Failed to sync profile', e);
    }
  };

  // 1. SIGN IN WITH PASSWORD
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      setIsLoading(false);
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        setErrorMessage(
          'Incorrect email or password. If you need the Admin password, use "GoTurfAdmin2026!" or click Quick-Fill below.'
        );
      } else {
        setErrorMessage(error.message);
      }
      return;
    }

    if (data.user) {
      // Fetch authoritative role from public.profiles
      let userRole: UserRole = 'player';
      try {
        const { data: profile } = await (supabase.from('profiles') as any)
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        userRole = profile?.role || (data.user.user_metadata?.role as UserRole) || 'player';
      } catch {
        userRole = (data.user.user_metadata?.role as UserRole) || 'player';
      }

      setIsLoading(false);
      const destination = determineRedirect(userRole);
      router.push(destination);
      router.refresh();
    }
  };

  // 2. CREATE NEW ACCOUNT (Instant via server with pre-confirmation)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
          role,
        }),
      });

      const regData = await res.json();
      if (!res.ok || !regData.success) {
        setIsLoading(false);
        setErrorMessage(regData.error || 'Failed to create account');
        return;
      }

      // Auto-login with the newly confirmed credentials
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      setIsLoading(false);

      if (signInError) {
        setErrorMessage(signInError.message);
        return;
      }

      if (signInData.user) {
        router.push(determineRedirect(role));
        router.refresh();
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Network error during registration');
    }
  };

  // 3. SEND OTP CODE
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const redirectUrl = `${window.location.origin}/auth/callback${
      redirectParam ? `?next=${encodeURIComponent(redirectParam)}` : ''
    }`;

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        data: {
          full_name: fullName.trim() || undefined,
          phone: phone.trim() || undefined,
          role,
        },
        emailRedirectTo: redirectUrl,
      },
    });

    setIsLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes('rate limit')) {
        setErrorMessage(
          'Supabase free email limit reached (max 3/hr). Please sign in using your password above!'
        );
      } else {
        setErrorMessage(error.message);
      }
    } else {
      setOtpSent(true);
      setSuccessMessage(`✨ A 6-digit verification code was sent to ${cleanEmail}.`);
    }
  };

  // 4. VERIFY OTP CODE
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !email) return;

    setIsLoading(true);
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: otpCode.trim(),
      type: 'email',
    });

    if (error || !data.user) {
      setIsLoading(false);
      setErrorMessage(error?.message || 'Invalid or expired 6-digit code.');
      return;
    }

    const userMetaRole = (data.user.user_metadata?.role as UserRole) || role;
    await syncProfile(data.user.id, cleanEmail, userMetaRole);
    setIsLoading(false);

    router.push(determineRedirect(userMetaRole));
    router.refresh();
  };

  return (
    <div className="w-full max-w-md bg-white border-2 border-[#03594d] rounded-[32px] p-6 sm:p-10 shadow-maggie-lg text-[#03594d]">
      {/* Top Primary Tabs: Sign In vs Create Account */}
      <div className="flex p-1.5 rounded-2xl bg-[#f9f8f4] border-2 border-[#03594d] mb-6 shadow-maggie-sm">
        <button
          type="button"
          onClick={() => {
            setActiveTab('signin');
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'signin'
              ? 'bg-[#03594d] text-[#82eda6] shadow-maggie-sm'
              : 'text-[#03594d]/70 hover:text-[#03594d]'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('signup');
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'signup'
              ? 'bg-[#ffff94] text-[#03594d] border-2 border-[#03594d] shadow-maggie-sm font-black'
              : 'text-[#03594d]/70 hover:text-[#03594d]'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Header Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-[#03594d]">
          {activeTab === 'signin' ? 'Sign In to GoTurf' : 'Join GoTurf'}
        </h1>
        <p className="text-xs font-semibold text-[#03594d]/80 mt-1">
          {activeTab === 'signin'
            ? 'Access your match passes, bookings, or venue manager'
            : 'Register to book live turf slots or list your sports venue'}
        </p>
      </div>

      {/* TAB 1: SIGN IN FORM */}
      {activeTab === 'signin' && (
        <>
          {/* Platform Admin Quick-Fill Card */}
          <div className="p-3.5 rounded-2xl bg-[#ffff94] border-2 border-[#03594d] shadow-maggie-sm mb-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#03594d] text-[#82eda6] px-2 py-0.5 rounded-full">
                  👑 Platform Admin
                </span>
                <p className="text-xs font-black text-[#03594d] mt-1">isadityax2005@gmail.com</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('isadityax2005@gmail.com');
                  setPassword('GoTurfAdmin2026!');
                  setSignInWithOtp(false);
                  setErrorMessage(null);
                  setSuccessMessage('✨ Admin credentials pre-filled. Click Sign In below!');
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#82eda6] text-[#03594d] border-2 border-[#03594d] text-xs font-black uppercase shadow-maggie-sm transition-all cursor-pointer shrink-0"
              >
                Quick-Fill ⚡
              </button>
            </div>
          </div>

          {!signInWithOtp ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-[#03594d] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] placeholder-[#03594d]/40 focus:outline-none focus:bg-white transition-colors"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-black uppercase text-[#03594d]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSignInWithOtp(true);
                      setErrorMessage(null);
                    }}
                    className="text-[11px] font-bold text-[#03594d] underline hover:opacity-75 cursor-pointer"
                  >
                    Use magic link email instead
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] placeholder-[#03594d]/40 focus:outline-none focus:bg-white transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-full font-black text-xs uppercase tracking-wider bg-[#03594d] text-[#82eda6] border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'Sign In to GoTurf →'}
              </button>
            </form>
          ) : (
            // Email OTP Sign In
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-[#03594d] mb-1.5">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] placeholder-[#03594d]/40 focus:outline-none focus:bg-white transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-full font-black text-xs uppercase tracking-wider bg-[#03594d] text-[#82eda6] border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? 'Sending...' : 'Send 6-Digit Code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignInWithOtp(false)}
                    className="w-full text-center text-xs font-bold text-[#03594d] underline"
                  >
                    &larr; Back to Password Login
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 rounded-xl bg-[#ffff94] border-2 border-[#03594d] text-xs font-bold text-[#03594d]">
                    📩 6-digit code sent to <strong>{email}</strong>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-[#03594d] mb-1.5">
                      Enter 6-Digit Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full px-4 py-3 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-center text-lg font-mono font-black tracking-widest text-[#03594d] placeholder-[#03594d]/30 focus:outline-none focus:bg-white transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length < 6}
                    className="w-full py-3.5 px-4 rounded-full font-black text-xs uppercase tracking-wider bg-[#03594d] text-[#82eda6] border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Enter GoTurf →'}
                  </button>

                  <div className="flex justify-between items-center text-xs font-bold pt-1">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[#03594d] underline"
                    >
                      Change Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignInWithOtp(false)}
                      className="text-[#03594d] underline"
                    >
                      Use Password Instead
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </>
      )}

      {/* TAB 2: CREATE ACCOUNT FORM */}
      {activeTab === 'signup' && (
        <form onSubmit={handleSignUp} className="space-y-4">
          {/* Account Role Selector */}
          <div>
            <label className="block text-xs font-black uppercase text-[#03594d] mb-1.5">
              I am joining as:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('player')}
                className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-[#03594d] transition-all cursor-pointer ${
                  role === 'player'
                    ? 'bg-[#03594d] text-[#82eda6] shadow-maggie-sm'
                    : 'bg-[#f9f8f4] text-[#03594d]/70 hover:bg-white'
                }`}
              >
                ⚽ Player
              </button>
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-[#03594d] transition-all cursor-pointer ${
                  role === 'owner'
                    ? 'bg-[#ffff94] text-[#03594d] shadow-maggie-sm'
                    : 'bg-[#f9f8f4] text-[#03594d]/70 hover:bg-white'
                }`}
              >
                🏟️ Turf Owner
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#03594d] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={role === 'player' ? 'Aditya Singh' : 'Rohan Mehta'}
              className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] placeholder-[#03594d]/40 focus:outline-none focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#03594d] mb-1.5">
              WhatsApp / Mobile Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98200 12345"
              className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] placeholder-[#03594d]/40 focus:outline-none focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#03594d] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] placeholder-[#03594d]/40 focus:outline-none focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#03594d] mb-1.5">
              Create Password (min. 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] placeholder-[#03594d]/40 focus:outline-none focus:bg-white transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-full font-black text-xs uppercase tracking-wider bg-[#03594d] text-[#82eda6] border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading
              ? 'Creating Account...'
              : role === 'owner'
              ? 'Create Turf Owner Account →'
              : 'Create Player Account →'}
          </button>
        </form>
      )}

      {/* Error & Success Messages */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-xl bg-rose-100 border-2 border-rose-500 text-rose-800 text-xs font-bold text-center shadow-maggie-sm">
          ⚠️ {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mt-4 p-3 rounded-xl bg-[#ffff94] border-2 border-[#03594d] text-[#03594d] text-xs font-bold text-center shadow-maggie-sm">
          {successMessage}
        </div>
      )}

      {/* Direct Portal Navigation Shortcuts */}
      <div className="mt-8 pt-6 border-t-2 border-[#03594d]/15 text-center">
        <span className="text-[11px] uppercase tracking-wider text-[#03594d]/70 font-black block mb-3">
          Direct Portal Navigation
        </span>
        <div className="flex gap-2">
          <Link
            href="/owner"
            className="flex-1 py-2 px-3 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-black text-[#03594d] hover:bg-[#ffff94] shadow-maggie-sm transition-colors text-center"
          >
            🏟️ Owner Portal &rarr;
          </Link>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setSignInWithOtp(false);
              setEmail('isadityax2005@gmail.com');
              setPassword('GoTurfAdmin2026!');
              setErrorMessage(null);
              setSuccessMessage('👑 Admin credentials loaded. Click "Sign In to GoTurf" above!');
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-[#ffff94] border-2 border-[#03594d] text-xs font-black text-[#03594d] hover:bg-white shadow-maggie-sm transition-colors cursor-pointer text-center"
          >
            ⚡ Admin Sign-In &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col justify-between selection:bg-[#ffff94] selection:text-[#03594d]">
      {/* Header */}
      <header className="border-b-2 border-[#03594d] px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#82eda6]/90">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-full bg-[#03594d] text-[#82eda6] flex items-center justify-center font-black text-sm shadow-maggie-sm group-hover:rotate-6 transition-transform">
            GT
          </div>
          <span className="font-black text-2xl tracking-tight text-[#03594d] lowercase">goturf</span>
          <span className="text-[10px] font-black uppercase tracking-wider bg-[#ffff94] text-[#03594d] px-2.5 py-0.5 rounded-full border border-[#03594d] shadow-maggie-sm">
            mumbai
          </span>
        </Link>
        <Link href="/" className="text-xs font-black uppercase text-[#03594d] hover:underline tracking-wider transition-colors">
          &larr; Back to Home
        </Link>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <Suspense
          fallback={
            <div className="w-full max-w-md bg-white border-2 border-[#03594d] rounded-[32px] p-8 text-center text-xs font-black text-[#03594d]">
              Loading login portal...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-[#03594d] px-6 py-4 text-center text-xs text-[#03594d]/75 font-bold bg-[#82eda6]">
        Secure Authentication &bull; Supabase Protected &bull; Instant Access
      </footer>
    </main>
  );
}
