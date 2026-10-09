'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PendingTurf {
  id: string;
  name: string;
  owner: string;
  phone: string;
  locality: string;
  sports: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AdminDashboardPage() {
  const [pendingList, setPendingList] = useState<PendingTurf[]>([
    {
      id: 'pending-1',
      name: 'Juhu Beach Sports Arena',
      owner: 'Sameer Kulkarni',
      phone: '+91 98200 99887',
      locality: 'Juhu, Mumbai',
      sports: 'Box Cricket & Pickleball',
      submittedAt: 'Today, 2:15 PM',
      status: 'pending',
    },
  ]);

  const [approvedTurfs, setApprovedTurfs] = useState([
    { name: 'Bandra Turf Arena [Demo]', locality: 'Bandra West', courts: 2, status: 'approved' },
    { name: 'Powai Smash Club [Demo]', locality: 'Powai', courts: 2, status: 'approved' },
    { name: 'Andheri Sports Hub [Demo]', locality: 'Andheri East', courts: 2, status: 'approved' },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const handleApprove = (turf: PendingTurf) => {
    setPendingList((prev) => prev.filter((p) => p.id !== turf.id));
    setApprovedTurfs((prev) => [
      ...prev,
      { name: turf.name, locality: turf.locality, courts: 2, status: 'approved' },
    ]);
    setNotification(`✅ Successfully approved "${turf.name}"! It is now live and visible to players.`);
  };

  const handleReject = (turf: PendingTurf) => {
    setPendingList((prev) => prev.filter((p) => p.id !== turf.id));
    setNotification(`⚠️ Rejected "${turf.name}". Marked as unlisted.`);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-neutral-950/80">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-black text-white text-sm">
              GT
            </div>
            <span className="font-bold text-lg tracking-tight text-white">GoTurf</span>
          </Link>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Admin Suite
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-neutral-400 hidden sm:inline">Aditya Singh (Platform Admin)</span>
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
          >
            Sign Out
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl w-full mx-auto px-6 py-10 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Platform Operations & Verification Queue
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Review submitted turf evidence, manage active venues, and inspect audit logs.
          </p>
        </div>

        {notification && (
          <div className="mb-6 p-4 rounded-2xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 flex justify-between items-center shadow-lg">
            <span>{notification}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-neutral-400 hover:text-white text-xs ml-4"
            >
              &times;
            </button>
          </div>
        )}

        {/* Verification Queue Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Verification Queue</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                {pendingList.length} Pending
              </span>
            </h2>
          </div>

          {pendingList.length > 0 ? (
            <div className="space-y-3">
              {pendingList.map((turf) => (
                <div
                  key={turf.id}
                  className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-semibold text-white text-sm">{turf.name}</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Owner: {turf.owner} &bull; {turf.phone} &bull; 📍 {turf.locality}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Sports: {turf.sports} &bull; Submitted: {turf.submittedAt}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(turf)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(turf)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-md shadow-emerald-500/20 transition-colors"
                    >
                      Approve Listing &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-neutral-900/20 border border-neutral-800 text-center text-xs text-neutral-500">
              No pending venues awaiting verification. All submissions reviewed.
            </div>
          )}
        </div>

        {/* Live Turfs Quick Overview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Live Approved Turfs (Mumbai)</h2>
            <Link
              href="/turfs"
              className="text-xs text-emerald-400 hover:underline"
            >
              View Player Discovery Page &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {approvedTurfs.map((t) => (
              <div key={t.name} className="p-4 rounded-2xl bg-neutral-900/30 border border-neutral-800/70">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-sm text-white">{t.name}</h4>
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">Active</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">{t.locality} &bull; {t.courts} Courts</p>
                <div className="mt-4 pt-3 border-t border-neutral-800/60 flex justify-between items-center text-xs">
                  <Link href="/turfs" className="text-neutral-400 hover:text-white">
                    Preview
                  </Link>
                  <span className="text-[11px] text-emerald-500 font-medium">Publicly Searchable</span>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Booking Disputes & Financial Operations */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Financial Disputes & Booking Refunds</h2>
              <p className="text-xs text-neutral-400">Issue administrative overrides and automated payment refunds directly to players.</p>
            </div>
            <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold">
              Gateway Refund Link Active
            </span>
          </div>

          <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800 overflow-hidden text-xs">
            <div className="grid grid-cols-12 bg-neutral-900/80 px-4 py-3 font-semibold text-neutral-400 border-b border-neutral-800">
              <div className="col-span-3">Booking ID / Player</div>
              <div className="col-span-3">Venue & Court</div>
              <div className="col-span-2">Amount Paid</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Admin Action</div>
            </div>

            <div className="divide-y divide-neutral-800/60">
              <div className="grid grid-cols-12 px-4 py-3.5 items-center">
                <div className="col-span-3">
                  <p className="font-bold text-white">#BKG-9921-MUM</p>
                  <p className="text-[11px] text-neutral-400">Karan Verma &bull; +91 98200 11223</p>
                </div>
                <div className="col-span-3">
                  <p className="text-white">Bandra Turf Arena</p>
                  <p className="text-[11px] text-neutral-400">Box Cricket (Court 1)</p>
                </div>
                <div className="col-span-2">
                  <p className="text-white font-semibold">₹1,845</p>
                  <p className="text-[10px] text-emerald-400">₹1,800 + ₹45 fee</p>
                </div>
                <div className="col-span-2">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
                        setNotification(`⚠️ Refund notice: ${data.message}`);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel & Refund
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Footer */}
      <footer className="border-t border-neutral-800/80 px-6 py-4 text-center text-xs text-neutral-600">
        GoTurf Admin Control Suite &bull; Audit Logging Active
      </footer>
    </main>
  );
}
