'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TurfItem {
  id: string;
  name: string;
  slug?: string;
  address: string;
  locality: string;
  status: 'pending' | 'approved' | 'suspended';
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  photos: string[];
  facilities?: string[];
  courts?: Array<{ name: string; sport: string; format: string }>;
  created_at: string;
}

interface OwnerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  turfCount: number;
  turfs?: Array<{ id: string; name: string; status: string }>;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalTurfs: 0,
    pendingCount: 0,
    approvedCount: 0,
    totalOwners: 0,
    totalUsers: 0,
  });
  const [pendingTurfs, setPendingTurfs] = useState<TurfItem[]>([]);
  const [approvedTurfs, setApprovedTurfs] = useState<TurfItem[]>([]);
  const [owners, setOwners] = useState<OwnerItem[]>([]);
  const [activeTab, setActiveTab] = useState<'queue' | 'owners' | 'live' | 'disputes'>('queue');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/overview');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setPendingTurfs(data.pendingTurfs || []);
        setApprovedTurfs(data.approvedTurfs || []);
        setOwners(data.owners || []);
      } else {
        setNotification(`⚠️ Failed to load admin metrics: ${data.error}`);
      }
    } catch {
      setNotification('Network error loading admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleVerify = async (turfId: string, action: 'approve' | 'reject') => {
    setActionLoadingId(turfId);
    try {
      const res = await fetch('/api/admin/verify-turf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turfId,
          status: action === 'approve' ? 'approved' : 'rejected',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNotification(
          action === 'approve'
            ? `✅ "${data.turf.name}" is now APPROVED and live on the public discovery page!`
            : `⚠️ "${data.turf.name}" has been marked unlisted/rejected.`
        );
        // Refresh live data
        await fetchOverview();
      } else {
        setNotification(`⚠️ ${data.error || 'Verification action failed'}`);
      }
    } catch {
      setNotification('Network error while updating verification status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col justify-between selection:bg-[#ffff94] selection:text-[#03594d]">
      {/* Top Navbar */}
      <header className="border-b-2 border-[#03594d] px-4 sm:px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#82eda6]/90">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-[#ffff94] border-2 border-[#03594d] shadow-maggie-sm flex items-center justify-center font-black text-[#03594d] text-sm group-hover:rotate-6 transition-transform">
              GT
            </div>
            <span className="font-black text-xl tracking-tight text-[#03594d]">GoTurf</span>
          </Link>
          <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#ffff94] text-[#03594d] border-2 border-[#03594d] shadow-maggie-sm">
            Admin Suite
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-xs font-bold">
          <span className="text-[#03594d] hidden sm:inline font-black">
            Aditya Singh (Platform Admin)
          </span>
          <Link
            href="/owner"
            className="px-3 py-1.5 rounded-xl bg-white border-2 border-[#03594d] text-[#03594d] hover:bg-[#ffff94] shadow-maggie-sm transition-all font-black uppercase text-[11px]"
          >
            Owner Portal
          </Link>
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-xl bg-[#ffff94] border-2 border-[#03594d] text-[#03594d] hover:bg-white shadow-maggie-sm transition-all font-black uppercase text-[11px]"
          >
            Switch Account
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-[#ffff94] border-2 border-[#03594d] rounded-full shadow-maggie-sm mb-2">
              Operations & Controls
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-[#03594d] tracking-tight uppercase">
              Platform Command Center
            </h1>
            <p className="text-xs font-bold text-[#03594d]/80 mt-1">
              Verify submitted turf evidence, manage registered venue partners, and inspect dispute overrides.
            </p>
          </div>

          <button
            onClick={fetchOverview}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#ffff94] text-[#03594d] border-2 border-[#03594d] text-xs font-black uppercase shadow-maggie-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            {loading ? 'Refreshing...' : '🔄 Refresh Data'}
          </button>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="mb-6 p-4 rounded-2xl bg-[#ffff94] border-2 border-[#03594d] text-xs font-bold text-[#03594d] flex justify-between items-center shadow-maggie animate-in fade-in">
            <span>{notification}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-[#03594d] hover:opacity-70 text-base font-black ml-4 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#03594d] shadow-maggie">
            <span className="text-[10px] font-black uppercase text-[#03594d]/70">Verification Queue</span>
            <p className="text-2xl sm:text-3xl font-black text-[#03594d] mt-1">{stats.pendingCount}</p>
            <span className="text-[10px] font-black text-amber-700">Awaiting Inspection</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#03594d] shadow-maggie">
            <span className="text-[10px] font-black uppercase text-[#03594d]/70">Registered Owners</span>
            <p className="text-2xl sm:text-3xl font-black text-[#03594d] mt-1">{stats.totalOwners}</p>
            <span className="text-[10px] font-black text-[#03594d]">Active Partners</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#03594d] shadow-maggie">
            <span className="text-[10px] font-black uppercase text-[#03594d]/70">Live Approved Turfs</span>
            <p className="text-2xl sm:text-3xl font-black text-[#03594d] mt-1">{stats.approvedCount}</p>
            <span className="text-[10px] font-black text-emerald-700">Publicly Bookable</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#03594d] shadow-maggie">
            <span className="text-[10px] font-black uppercase text-[#03594d]/70">Platform Users</span>
            <p className="text-2xl sm:text-3xl font-black text-[#03594d] mt-1">{stats.totalUsers}</p>
            <span className="text-[10px] font-black text-[#03594d]">Stored in Supabase</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-[#03594d] transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-[#03594d] text-[#82eda6] shadow-maggie'
                : 'bg-white text-[#03594d] hover:bg-[#ffff94] shadow-maggie-sm'
            }`}
          >
            📋 Verification Queue ({pendingTurfs.length})
          </button>
          <button
            onClick={() => setActiveTab('owners')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-[#03594d] transition-all cursor-pointer ${
              activeTab === 'owners'
                ? 'bg-[#03594d] text-[#82eda6] shadow-maggie'
                : 'bg-white text-[#03594d] hover:bg-[#ffff94] shadow-maggie-sm'
            }`}
          >
            👥 Turf Owners Directory ({owners.length})
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-[#03594d] transition-all cursor-pointer ${
              activeTab === 'live'
                ? 'bg-[#03594d] text-[#82eda6] shadow-maggie'
                : 'bg-white text-[#03594d] hover:bg-[#ffff94] shadow-maggie-sm'
            }`}
          >
            🏟️ Live Turfs ({approvedTurfs.length})
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-[#03594d] transition-all cursor-pointer ${
              activeTab === 'disputes'
                ? 'bg-[#03594d] text-[#82eda6] shadow-maggie'
                : 'bg-white text-[#03594d] hover:bg-[#ffff94] shadow-maggie-sm'
            }`}
          >
            💸 Financial Disputes & Refunds
          </button>
        </div>

        {/* TAB 1: Verification Queue */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-tight text-[#03594d]">
                Pending Verification Queue
              </h2>
              <span className="text-xs font-bold text-[#03594d]/80">
                New venue submissions requiring admin inspection
              </span>
            </div>

            {pendingTurfs.length > 0 ? (
              <div className="space-y-4">
                {pendingTurfs.map((turf) => (
                  <div
                    key={turf.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-[#03594d] shadow-maggie space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-lg text-[#03594d] uppercase">{turf.name}</h3>
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#ffff94] border border-[#03594d]">
                            Pending
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#03594d]/80 mt-1">
                          📍 {turf.address} &bull; <span className="font-black">{turf.locality}</span>
                        </p>
                        <p className="text-xs font-bold text-[#03594d] mt-1">
                          Owner: <strong>{turf.ownerName}</strong> &bull; 📞{' '}
                          <a href={`tel:${turf.ownerPhone}`} className="underline hover:text-black">
                            {turf.ownerPhone || 'No phone provided'}
                          </a>{' '}
                          &bull; ✉️ {turf.ownerEmail || 'No email provided'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleVerify(turf.id, 'reject')}
                          disabled={actionLoadingId === turf.id}
                          className="px-4 py-2 rounded-xl bg-[#fccddc] hover:bg-white text-[#03594d] border-2 border-[#03594d] text-xs font-black uppercase shadow-maggie-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleVerify(turf.id, 'approve')}
                          disabled={actionLoadingId === turf.id}
                          className="px-5 py-2 rounded-xl bg-[#ffff94] hover:bg-white text-[#03594d] border-2 border-[#03594d] text-xs font-black uppercase shadow-maggie-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          {actionLoadingId === turf.id ? 'Approving...' : 'Approve Listing &rarr;'}
                        </button>
                      </div>
                    </div>

                    {/* Uploaded Photos Gallery */}
                    {turf.photos && turf.photos.length > 0 && (
                      <div className="pt-2 border-t-2 border-[#03594d]/10">
                        <p className="text-[11px] font-black uppercase text-[#03594d] mb-2">
                          Uploaded Evidence Photos ({turf.photos.length})
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {turf.photos.map((photoUrl, idx) => (
                            <a
                              key={idx}
                              href={photoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block aspect-video rounded-xl overflow-hidden border-2 border-[#03594d] bg-gray-100 hover:scale-105 transition-transform"
                            >
                              <img
                                src={photoUrl}
                                alt={`Venue proof ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Facilities / Courts summary */}
                    {turf.facilities && turf.facilities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {turf.facilities.map((fac) => (
                          <span
                            key={fac}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f9f8f4] border border-[#03594d]/40 text-[#03594d]"
                          >
                            ✓ {fac}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-white border-2 border-[#03594d] text-center shadow-maggie">
                <div className="text-3xl mb-2">🎉</div>
                <h3 className="font-black text-base uppercase text-[#03594d]">Queue is all caught up!</h3>
                <p className="text-xs font-bold text-[#03594d]/70 mt-1">
                  No pending turf venues awaiting verification. Submit a test turf in the{' '}
                  <Link href="/owner/new-turf" className="underline hover:text-black">
                    Owner Onboarding Wizard
                  </Link>{' '}
                  to test real photo verification.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Turf Owners Directory */}
        {activeTab === 'owners' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-tight text-[#03594d]">
                Registered Turf Owners & Partners
              </h2>
              <span className="text-xs font-bold text-[#03594d]/80">
                Authoritative profiles stored in Supabase
              </span>
            </div>

            <div className="rounded-3xl bg-white border-2 border-[#03594d] shadow-maggie overflow-hidden text-xs">
              <div className="grid grid-cols-12 bg-[#f9f8f4] px-4 py-3 font-black text-[#03594d] border-b-2 border-[#03594d]">
                <div className="col-span-4 sm:col-span-3">Owner Name</div>
                <div className="col-span-4 sm:col-span-3">Contact Email</div>
                <div className="col-span-4 sm:col-span-2">Phone</div>
                <div className="hidden sm:block sm:col-span-2 text-center">Venues</div>
                <div className="hidden sm:block sm:col-span-2 text-right">Role</div>
              </div>

              <div className="divide-y-2 border-[#03594d]/10">
                {owners.map((owner) => (
                  <div
                    key={owner.id}
                    className="grid grid-cols-12 px-4 py-3.5 items-center font-bold text-[#03594d] hover:bg-[#ffff94]/20 transition-colors"
                  >
                    <div className="col-span-4 sm:col-span-3">
                      <p className="font-black text-xs text-[#03594d]">{owner.name}</p>
                      <p className="text-[10px] text-[#03594d]/60 font-medium">ID: {owner.id.substring(0, 8)}...</p>
                    </div>
                    <div className="col-span-4 sm:col-span-3 truncate text-[#03594d]/90">
                      {owner.email || '—'}
                    </div>
                    <div className="col-span-4 sm:col-span-2 text-[#03594d]">
                      {owner.phone ? (
                        <a href={`tel:${owner.phone}`} className="underline hover:text-black">
                          {owner.phone}
                        </a>
                      ) : (
                        <span className="text-[#03594d]/50">—</span>
                      )}
                    </div>
                    <div className="hidden sm:block sm:col-span-2 text-center font-black">
                      <span className="px-2 py-0.5 rounded-full bg-[#82eda6] border border-[#03594d]">
                        {owner.turfCount} Venue{owner.turfCount === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="hidden sm:block sm:col-span-2 text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black bg-[#ffff94] border border-[#03594d]">
                        {owner.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Live Approved Turfs */}
        {activeTab === 'live' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-tight text-[#03594d]">
                Live Approved Turfs in Mumbai
              </h2>
              <Link
                href="/turfs"
                className="text-xs font-black text-[#03594d] underline hover:opacity-80"
              >
                View Player Discovery Page &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {approvedTurfs.map((t) => (
                <div key={t.id} className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#03594d] shadow-maggie">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-sm text-[#03594d] uppercase">{t.name}</h4>
                    <span className="text-[10px] bg-[#82eda6] text-[#03594d] border-2 border-[#03594d] px-2 py-0.5 rounded-full uppercase font-black">
                      Active
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#03594d]/80 mt-1">
                    📍 {t.locality} &bull; {t.courts?.length || 2} Courts
                  </p>
                  <p className="text-[11px] font-bold text-[#03594d]/70 mt-1">
                    Partner: {t.ownerName}
                  </p>
                  <div className="mt-4 pt-3 border-t-2 border-[#03594d]/20 flex justify-between items-center text-xs font-black">
                    <Link href={`/turfs/${t.slug}`} className="text-[#03594d] hover:underline">
                      Preview Booking &rarr;
                    </Link>
                    <span className="text-[10px] text-emerald-800 uppercase font-black">Public</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Financial Disputes & Booking Refunds */}
        {activeTab === 'disputes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black uppercase text-[#03594d]">Financial Disputes & Refunds</h2>
                <p className="text-xs font-bold text-[#03594d]/80">
                  Execute admin overrides and trigger simulated gateway payment refunds.
                </p>
              </div>
              <span className="text-xs text-[#03594d] bg-[#ffff94] border-2 border-[#03594d] shadow-maggie-sm px-3 py-1 rounded-full font-black">
                Gateway Connected
              </span>
            </div>

            <div className="rounded-3xl bg-white border-2 border-[#03594d] shadow-maggie overflow-hidden text-xs">
              <div className="grid grid-cols-12 bg-[#f9f8f4] px-4 py-3 font-black text-[#03594d] border-b-2 border-[#03594d]">
                <div className="col-span-3">Booking ID / Player</div>
                <div className="col-span-3">Venue & Court</div>
                <div className="col-span-2">Amount Paid</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Admin Action</div>
              </div>

              <div className="divide-y-2 border-[#03594d]/10">
                <div className="grid grid-cols-12 px-4 py-3.5 items-center font-bold">
                  <div className="col-span-3">
                    <p className="font-black text-[#03594d]">#BKG-9921-MUM</p>
                    <p className="text-[11px] text-[#03594d]/70">Karan Verma &bull; +91 98200 11223</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-[#03594d] font-bold">Bandra Turf Arena</p>
                    <p className="text-[11px] text-[#03594d]/70">Box Cricket (Court 1)</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[#03594d] font-black text-sm">₹1,845</p>
                    <p className="text-[10px] text-[#03594d]/70">₹1,800 + ₹45 fee</p>
                  </div>
                  <div className="col-span-2">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black bg-[#82eda6] text-[#03594d] border-2 border-[#03594d]">
                      Confirmed
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <button
                      onClick={async () => {
                        const res = await fetch('/api/payments/refund', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            bookingId: 'booking-preseeded-1',
                            reason: 'Admin dispute override: Court maintenance conflict',
                            adminOverride: true,
                          }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          setNotification('💸 100% Refund (₹1,845) initiated to player UPI source via Razorpay.');
                        } else {
                          setNotification(`⚠️ Refund notice: ${data.message || data.error}`);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#fccddc] hover:bg-white text-[#03594d] border-2 border-[#03594d] text-xs font-black shadow-maggie-sm transition-all cursor-pointer"
                    >
                      Cancel & Refund
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-[#03594d] bg-[#f9f8f4] px-6 py-4 text-center text-xs font-bold text-[#03594d]/80">
        GoTurf Admin Control Suite &bull; Supabase Operations Synchronized
      </footer>
    </main>
  );
}
