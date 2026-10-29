'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types/database';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  created_at?: string;
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isResetMode = searchParams.get('reset') === 'true';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile() {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          router.push('/login?redirect=/profile');
          return;
        }

        const { data: profileRow } = await supabase
          .from('profiles')
          .select('id, name, email, phone, role, created_at')
          .eq('id', authData.user.id)
          .maybeSingle<{
            id: string;
            name: string;
            email: string;
            phone: string | null;
            role: UserRole;
            created_at?: string;
          }>();

        const loadedProfile: UserProfile = {
          id: authData.user.id,
          email: authData.user.email || profileRow?.email || '',
          name: profileRow?.name || authData.user.user_metadata?.full_name || 'Player',
          phone: profileRow?.phone || '',
          role: profileRow?.role || 'player',
          created_at: profileRow?.created_at,
        };

        setProfile(loadedProfile);
        setNameInput(loadedProfile.name);
        setPhoneInput(loadedProfile.phone);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setNotification({ type: 'error', message: 'Unable to load profile information.' });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setNotification(null);

    try {
      const res = await fetch('/api/auth/sync-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput.trim(),
          phone: phoneInput.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.error || 'Failed to update profile.' });
      } else {
        setProfile((prev) => (prev ? { ...prev, name: nameInput.trim(), phone: phoneInput.trim() } : null));
        setNotification({ type: 'success', message: 'Profile details saved successfully!' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Network error while updating profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setNotification({ type: 'error', message: 'Password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setNotification({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setPasswordUpdating(true);
    setNotification(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setNotification({ type: 'error', message: error.message });
      } else {
        setNewPassword('');
        setConfirmPassword('');
        setNotification({ type: 'success', message: 'Password updated successfully!' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Network error while setting new password.' });
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 bg-white border-2 border-[#03594d] rounded-[32px] text-center font-black text-xs text-[#03594d] shadow-maggie">
        Loading profile details...
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border-2 text-xs font-bold shadow-maggie-sm ${
            notification.type === 'success'
              ? 'bg-[#ffff94] border-[#03594d] text-[#03594d]'
              : 'bg-rose-100 border-rose-500 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? '✅ ' : '⚠️ '}
          {notification.message}
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white border-2 border-[#03594d] rounded-[32px] p-6 sm:p-8 shadow-maggie text-[#03594d]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#03594d]/10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#03594d] text-[#82eda6] flex items-center justify-center font-black text-2xl border-2 border-[#03594d] shadow-maggie-sm">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-[#03594d]">{profile.name}</h1>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-[#03594d] ${
                    profile.role === 'admin'
                      ? 'bg-[#03594d] text-[#82eda6]'
                      : profile.role === 'owner'
                      ? 'bg-[#ffff94] text-[#03594d]'
                      : 'bg-[#82eda6] text-[#03594d]'
                  }`}
                >
                  {profile.role === 'admin' ? '⚡ Admin' : profile.role === 'owner' ? '🏟️ Turf Owner' : '⚽ Player'}
                </span>
              </div>
              <p className="text-xs font-semibold text-[#03594d]/75 mt-0.5">{profile.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/bookings"
              className="px-4 py-2 rounded-xl bg-[#ffff94] text-[#03594d] border-2 border-[#03594d] text-xs font-black uppercase shadow-maggie-sm hover:bg-white transition-all"
            >
              🎟️ My Passes
            </Link>
            {profile.role === 'owner' && (
              <Link
                href="/owner"
                className="px-4 py-2 rounded-xl bg-[#03594d] text-[#82eda6] border-2 border-[#03594d] text-xs font-black uppercase shadow-maggie-sm hover:bg-[#02463c] transition-all"
              >
                🏟️ Owner Portal
              </Link>
            )}
            {profile.role === 'admin' && (
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl bg-[#03594d] text-[#82eda6] border-2 border-[#03594d] text-xs font-black uppercase shadow-maggie-sm hover:bg-[#02463c] transition-all"
              >
                ⚡ Admin Suite
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl bg-[#f9f8f4] text-[#03594d] border-2 border-[#03594d] text-xs font-black uppercase shadow-maggie-sm hover:bg-rose-50 hover:text-rose-700 transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Member Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
          <div className="p-4 rounded-2xl bg-[#f9f8f4] border-2 border-[#03594d]">
            <span className="text-[10px] uppercase font-black text-[#03594d]/60 block mb-1">GoTurf Member ID</span>
            <span className="font-mono font-black text-[#03594d] break-all">{profile.id.slice(0, 18)}...</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#f9f8f4] border-2 border-[#03594d]">
            <span className="text-[10px] uppercase font-black text-[#03594d]/60 block mb-1">Registered Phone</span>
            <span className="font-black text-[#03594d]">{profile.phone || 'Not provided'}</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#f9f8f4] border-2 border-[#03594d]">
            <span className="text-[10px] uppercase font-black text-[#03594d]/60 block mb-1">Account Role</span>
            <span className="font-black text-[#03594d] uppercase">{profile.role} account</span>
          </div>
        </div>
      </div>

      {/* Edit Details Form */}
      <div className="bg-white border-2 border-[#03594d] rounded-[32px] p-6 sm:p-8 shadow-maggie text-[#03594d]">
        <h2 className="text-lg font-black uppercase tracking-tight mb-4">Edit Profile Details</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-[#03594d] mb-1.5">
                Display / Full Name
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:outline-none focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#03594d] mb-1.5">
                WhatsApp / Mobile Number
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+91 98200 12345"
                className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:outline-none focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 rounded-full font-black text-xs uppercase tracking-wider bg-[#03594d] text-[#82eda6] border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Reset */}
      <div className="bg-white border-2 border-[#03594d] rounded-[32px] p-6 sm:p-8 shadow-maggie text-[#03594d]">
        <h2 className="text-lg font-black uppercase tracking-tight mb-1">
          {isResetMode ? '🔑 Set New Password' : 'Change Password'}
        </h2>
        <p className="text-xs font-semibold text-[#03594d]/75 mb-4">
          Ensure your account uses a secure password of at least 8 characters.
        </p>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-[#03594d] mb-1.5">
                New Password (min 8 chars)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:outline-none focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#03594d] mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:outline-none focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordUpdating}
              className="py-2.5 px-6 rounded-full font-black text-xs uppercase tracking-wider bg-[#03594d] text-[#82eda6] border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] transition-all cursor-pointer disabled:opacity-50"
            >
              {passwordUpdating ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col justify-between selection:bg-[#ffff94] selection:text-[#03594d]">
      {/* Top Navbar */}
      <header className="border-b-2 border-[#03594d] px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#82eda6]/90 text-[#03594d]">
        <Link href="/" className="flex items-center gap-2 text-xs font-black text-[#03594d] hover:underline uppercase tracking-wider">
          <span>&larr;</span>
          <span>Home</span>
        </Link>
        <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#ffff94] text-[#03594d] border border-[#03594d] shadow-maggie-sm">
          Member Profile
        </span>
      </header>

      {/* Main Container */}
      <div className="px-6 py-10 flex-1">
        <Suspense
          fallback={
            <div className="w-full max-w-2xl mx-auto p-8 bg-white border-2 border-[#03594d] rounded-[32px] text-center font-black text-xs text-[#03594d] shadow-maggie">
              Loading profile portal...
            </div>
          }
        >
          <ProfileContent />
        </Suspense>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-[#03594d] bg-[#82eda6] px-6 py-4 text-center text-xs font-bold text-[#03594d]/80">
        GoTurf Member Account &bull; Identity Secured by Supabase
      </footer>
    </main>
  );
}

