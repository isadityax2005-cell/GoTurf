'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [role, setRole] = useState<'player' | 'owner'>('player');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    // Simulate sending magic link or client-side auth attempt
    setTimeout(() => {
      setIsLoading(false);
      setStatusMessage(`✨ Magic login link prepared for ${email}! In demo mode, sign-in is mocked.`);
    }, 800);
  };

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
        <div className="w-full max-w-md bg-white border-2 border-[#03594d] rounded-[32px] p-8 sm:p-10 shadow-maggie-lg text-[#03594d]">
          {/* Role Selector Tabs */}
          <div className="flex p-1 rounded-2xl bg-[#f9f8f4] border-2 border-[#03594d] mb-6">
            <button
              type="button"
              onClick={() => setRole('player')}
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
              onClick={() => setRole('owner')}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                role === 'owner'
                  ? 'bg-[#ffff94] text-[#03594d] border border-[#03594d] shadow-maggie-sm'
                  : 'text-[#03594d]/70 hover:text-[#03594d]'
              }`}
            >
              🏟️ Turf Owner
            </button>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#03594d]">
              {role === 'player' ? 'Welcome to GoTurf' : 'Turf Partner Portal'}
            </h1>
            <p className="text-xs font-semibold text-[#03594d]/80 mt-1">
              {role === 'player'
                ? 'Sign in to book live slots across Mumbai'
                : 'Sign in to manage your turf availability, prices, and offline blocks'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 12345"
                className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] placeholder-[#03594d]/40 focus:outline-none focus:bg-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-full font-black text-xs uppercase tracking-wider bg-[#03594d] text-[#82eda6] border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              {isLoading
                ? 'Preparing Link...'
                : role === 'owner'
                ? 'Sign In as Turf Owner'
                : 'Sign In / Sign Up'}
            </button>
          </form>

          {statusMessage && (
            <div className="mt-4 p-3 rounded-xl bg-[#ffff94] border-2 border-[#03594d] text-[#03594d] text-xs font-bold text-center shadow-maggie-sm">
              {statusMessage}
            </div>
          )}

          {/* Quick Demo Role Switcher for Phase 2 Testing */}
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
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-[#03594d] px-6 py-4 text-center text-xs text-[#03594d]/75 font-bold bg-[#82eda6]">
        Passwordless Authentication &bull; Zero SMS Cost &bull; Instant Access
      </footer>
    </main>
  );
}
