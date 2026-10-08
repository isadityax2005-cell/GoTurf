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
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-black text-sm">
            GT
          </div>
          <span className="font-bold text-lg tracking-tight text-white">GoTurf</span>
        </Link>
        <Link href="/" className="text-xs text-neutral-400 hover:text-white transition-colors">
          &larr; Back to Home
        </Link>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          {/* Role Selector Tabs */}
          <div className="flex p-1 rounded-2xl bg-neutral-950 border border-neutral-800/80 mb-6">
            <button
              type="button"
              onClick={() => setRole('player')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                role === 'player'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              ⚽ Player Account
            </button>
            <button
              type="button"
              onClick={() => setRole('owner')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                role === 'owner'
                  ? 'bg-emerald-500 text-black shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              🏟️ Turf Owner
            </button>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {role === 'player' ? 'Welcome to GoTurf' : 'Turf Partner Portal'}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              {role === 'player'
                ? 'Sign in to book live slots across Mumbai'
                : 'Sign in to manage your turf availability, prices, and offline blocks'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === 'player' ? 'Karan Verma' : 'Rohan Mehta'}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                WhatsApp / Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 12345"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-lg ${
                role === 'owner'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:opacity-95 shadow-emerald-500/20'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              {isLoading
                ? 'Preparing Link...'
                : role === 'owner'
                ? 'Sign In as Turf Owner'
                : 'Sign In / Sign Up'}
            </button>
          </form>

          {statusMessage && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center">
              {statusMessage}
            </div>
          )}

          {/* Quick Demo Role Switcher for Phase 2 Testing */}
          <div className="mt-8 pt-6 border-t border-neutral-800/80 text-center">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold block mb-3">
              Direct Portal Navigation (Protected Routes)
            </span>
            <div className="flex gap-2">
              <Link
                href="/owner"
                className="flex-1 py-2 px-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
              >
                Owner Portal &rarr;
              </Link>
              <Link
                href="/admin"
                className="flex-1 py-2 px-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 hover:border-rose-500/50 hover:text-rose-400 transition-colors"
              >
                Admin Suite &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 px-6 py-4 text-center text-xs text-neutral-600">
        Passwordless Authentication &bull; Zero SMS Cost &bull; Instant Access
      </footer>
    </main>
  );
}
