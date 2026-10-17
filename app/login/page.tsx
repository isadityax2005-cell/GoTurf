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

  // Auth Method: 'otp' (Magic link / 6-digit code) or 'password'
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [role, setRole] = useState<UserRole>('player');
  const [isSignUp, setIsSignUp] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // UI Flow States
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam === 'auth_failed' ? 'Authentication link expired or invalid. Please try again.' : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  // Helper to sync profile into public.profiles
  const syncProfile = async (userId: string, userEmail: string) => {
    try {
      await fetch('/api/auth/sync-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email: userEmail,
          name: fullName || undefined,
          phone: phone || undefined,
          role,
        }),
      });
    } catch (e) {
      console.error('Failed to sync profile', e);
    }
  };

  const determineRedirect = (targetRole: UserRole) => {
    if (redirectParam) return redirectParam;
    if (targetRole === 'admin') return '/admin';
    if (targetRole === 'owner') return '/owner';
    return '/turfs';
  };

  // 1. Send OTP / Magic Link
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const redirectUrl = `${window.location.origin}/auth/callback${
      redirectParam ? `?next=${encodeURIComponent(redirectParam)}` : ''
    }`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
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
          'Supabase email rate limit reached (max 3/hr on free tier). Please switch to the "🔑 Password Login" tab above to sign in or create your account instantly!'
        );
      } else {
        setErrorMessage(error.message);
      }
    } else {
      setOtpSent(true);
      setSuccessMessage(`✨ A 6-digit login code and magic link have been sent to ${email}.`);
    }
  };

  // 2. Verify 6-Digit OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !email) return;

    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otpCode.trim(),
      type: 'email',
    });

    if (error || !data.user) {
      setIsLoading(false);
      setErrorMessage(error?.message || 'Invalid or expired 6-digit code. Please try again.');
      return;
    }

    await syncProfile(data.user.id, data.user.email || email);
    setIsLoading(false);

    const dest = determineRedirect(role);
    router.push(dest);
    router.refresh();
  };

  // 3. Password Sign In / Sign Up (Uses server-side instant registration to bypass email rate limits)
  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage(null);

    if (isSignUp) {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            fullName,
            phone,
            role,
          }),
        });

        const regData = await res.json();
        if (!res.ok || !regData.success) {
          setIsLoading(false);
          setErrorMessage(regData.error || 'Failed to create account');
          return;
        }

        // Auto sign-in immediately with the verified credentials
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
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
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      setIsLoading(false);
      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setErrorMessage(
            'Invalid credentials. If you haven\'t created a password for this email yet, click "Need an account? Sign up here" below.'
          );
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (data.user) {
        await syncProfile(data.user.id, data.user.email || email);
        router.push(determineRedirect(role));
        router.refresh();
      }
    }
  };

  return (
    <div className="w-full max-w-md bg-white border-2 border-[#03594d] rounded-[32px] p-8 sm:p-10 shadow-maggie-lg text-[#03594d]">
      {/* Role Selector Tabs */}
      <div className="flex p-1 rounded-2xl bg-[#f9f8f4] border-2 border-[#03594d] mb-6">
        <button
          type="button"
          onClick={() => {
            setRole('player');
            setOtpSent(false);
            setErrorMessage(null);
          }}
          className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
            role === 'player'
              ? 'bg-[#03594d] text-[#82eda6] shadow-maggie-sm'
              : 'text-[#03594d]/70 hover:text-[#03594d]'
          }`}
        >
          ⚽ Player Account
        </button>
        <button
          type="button"
          onClick={() => {
            setRole('owner');
            setOtpSent(false);
            setErrorMessage(null);
          }}
          className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
            role === 'owner'
              ? 'bg-[#ffff94] text-[#03594d] border border-[#03594d] shadow-maggie-sm'
              : 'text-[#03594d]/70 hover:text-[#03594d]'
          }`}
        >
          🏟️ Turf Owner
        </button>
      </div>

      {/* Header Info */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-[#03594d]">
          {role === 'player' ? 'Welcome to GoTurf' : 'Turf Partner Portal'}
        </h1>
        <p className="text-xs font-semibold text-[#03594d]/80 mt-1">
          {role === 'player'
            ? 'Sign in to book live slots across Mumbai turfs'
            : 'Sign in to manage your turf availability, prices, and offline blocks'}
        </p>
      </div>

      {/* Auth Mode Toggle (OTP vs Password) */}
      <div className="flex border-b-2 border-[#03594d]/15 pb-4 mb-5 text-xs font-black">
        <button
          type="button"
          onClick={() => {
            setAuthMethod('otp');
            setErrorMessage(null);
          }}
          className={`flex-1 pb-1 transition-all ${
            authMethod === 'otp'
              ? 'border-b-2 border-[#03594d] text-[#03594d]'
              : 'text-[#03594d]/50 hover:text-[#03594d]'
          }`}
        >
          ✨ One-Time Code / Magic Link
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMethod('password');
            setErrorMessage(null);
          }}
          className={`flex-1 pb-1 transition-all ${
            authMethod === 'password'
              ? 'border-b-2 border-[#03594d] text-[#03594d]'
              : 'text-[#03594d]/50 hover:text-[#03594d]'
          }`}
        >
          🔑 Password Login
        </button>
      </div>

      {/* Mode A: OTP / Magic Link */}
      {authMethod === 'otp' && (
        <>
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-[#03594d] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={role === 'player' ? 'Karan Verma' : 'Rohan Mehta'}
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
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] placeholder-[#03594d]/40 focus:outline-none focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#03594d] mb-1.5">
                  WhatsApp / Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98200 12345"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] placeholder-[#03594d]/40 focus:outline-none focus:bg-white transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-full font-black text-xs uppercase tracking-wider bg-[#03594d] text-[#82eda6] border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Sending Code...' : 'Send Login Code & Magic Link'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#ffff94] border-2 border-[#03594d] text-xs font-bold text-[#03594d] shadow-maggie-sm">
                📩 We sent a 6-digit code and a magic link to <strong>{email}</strong>.
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
                  className="text-[#03594d] underline hover:opacity-75"
                >
                  &larr; Change Email
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="text-[#03594d] underline hover:opacity-75 disabled:opacity-50"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* Mode B: Password Auth */}
      {authMethod === 'password' && (
        <form onSubmit={handlePasswordAuth} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-black uppercase text-[#03594d] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={role === 'player' ? 'Karan Verma' : 'Rohan Mehta'}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] placeholder-[#03594d]/40 focus:outline-none focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#03594d] mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98200 12345"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] placeholder-[#03594d]/40 focus:outline-none focus:bg-white transition-colors"
                />
              </div>
            </>
          )}

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
            <label className="block text-xs font-black uppercase text-[#03594d] mb-1.5">
              Password
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
              ? 'Authenticating...'
              : isSignUp
              ? 'Create Account & Sign In'
              : 'Sign In with Password'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-xs font-bold text-[#03594d] underline hover:opacity-75"
            >
              {isSignUp
                ? 'Already have an account? Sign in instead'
                : 'Need an account? Sign up here'}
            </button>
          </div>
        </form>
      )}

      {/* Messages */}
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

      {/* Direct Portal Navigation */}
      <div className="mt-8 pt-6 border-t-2 border-[#03594d]/15 text-center">
        <span className="text-[11px] uppercase tracking-wider text-[#03594d]/70 font-black block mb-3">
          Direct Portal Navigation
        </span>
        <div className="flex gap-2">
          <Link
            href="/owner"
            className="flex-1 py-2 px-3 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-black text-[#03594d] hover:bg-[#ffff94] shadow-maggie-sm transition-colors"
          >
            Owner Portal &rarr;
          </Link>
          <Link
            href="/admin"
            className="flex-1 py-2 px-3 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-black text-[#03594d] hover:bg-[#ffff94] shadow-maggie-sm transition-colors"
          >
            Admin Suite &rarr;
          </Link>
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
        Passwordless Authentication &bull; Zero SMS Cost &bull; Instant Access
      </footer>
    </main>
  );
}
