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
    <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col justify-between selection:bg-[#ffff94] selection:text-[#03594d]">
      {/* Top Navbar */}
      <header className="border-b-2 border-[#03594d] px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#82eda6]/90">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-[#ffff94] border-2 border-[#03594d] shadow-maggie-sm flex items-center justify-center font-black text-[#03594d] text-sm group-hover:rotate-6 transition-transform">
              GT
            </div>
            <span className="font-black text-xl tracking-tight text-[#03594d]">GoTurf</span>
          </Link>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#ffff94] text-[#03594d] border-2 border-[#03594d] shadow-maggie-sm">
            Admin Suite
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-[#03594d]/80 hidden sm:inline">Aditya Singh (Platform Admin)</span>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-white border-2 border-[#03594d] text-[#03594d] hover:bg-[#ffff94] shadow-maggie-sm transition-all font-bold"
          >
            Sign Out
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl w-full mx-auto px-6 py-10 flex-1">
        <div className="mb-8">
          <span className="inline-block text-xs font-black uppercase tracking-wider px-3 py-1 bg-[#ffff94] border-2 border-[#03594d] rounded-full shadow-maggie-sm mb-2">
            Operations & Controls
          </span>
          <h1 className="text-3xl font-black text-[#03594d] tracking-tight">
            Platform Operations & Verification Queue
          </h1>
          <p className="text-sm font-medium text-[#03594d]/80 mt-1">
            Review submitted turf evidence, manage active venues, and inspect audit logs.
          </p>
        </div>

        {notification && (
          <div className="mb-6 p-4 rounded-2xl bg-[#ffff94] border-2 border-[#03594d] text-xs font-bold text-[#03594d] flex justify-between items-center shadow-maggie">
            <span>{notification}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-[#03594d] hover:opacity-70 text-base font-black ml-4"
            >
              &times;
            </button>
          </div>
        )}

        {/* Verification Queue Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-[#03594d] flex items-center gap-2">
              <span>Verification Queue</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#fdc068] text-[#03594d] border-2 border-[#03594d] font-black">
                {pendingList.length} Pending
              </span>
            </h2>
          </div>

          {pendingList.length > 0 ? (
            <div className="space-y-3">
              {pendingList.map((turf) => (
                <div
                  key={turf.id}
                  className="p-5 rounded-2xl bg-white border-2 border-[#03594d] shadow-maggie flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-black text-[#03594d] text-base">{turf.name}</h3>
                    <p className="text-xs font-medium text-[#03594d]/80 mt-0.5">
                      Owner: {turf.owner} &bull; {turf.phone} &bull; 📍 {turf.locality}
                    </p>
                    <p className="text-xs font-bold text-[#03594d]/60 mt-1">
                      Sports: {turf.sports} &bull; Submitted: {turf.submittedAt}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(turf)}
                      className="px-4 py-2 rounded-xl bg-[#fccddc] hover:bg-white text-[#03594d] border-2 border-[#03594d] text-xs font-black shadow-maggie-sm transition-all"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(turf)}
                      className="px-5 py-2 rounded-xl bg-[#ffff94] hover:bg-white text-[#03594d] border-2 border-[#03594d] text-xs font-black shadow-maggie-sm transition-all"
                    >
                      Approve Listing &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white/70 border-2 border-[#03594d] text-center text-xs font-bold text-[#03594d]/70">
              No pending venues awaiting verification. All submissions reviewed.
            </div>
          )}
        </div>

        {/* Live Turfs Quick Overview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-[#03594d]">Live Approved Turfs (Mumbai)</h2>
            <Link
              href="/turfs"
              className="text-xs font-black text-[#03594d] underline hover:opacity-80"
            >
              View Player Discovery Page &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {approvedTurfs.map((t) => (
              <div key={t.name} className="p-4 rounded-2xl bg-white border-2 border-[#03594d] shadow-maggie">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-sm text-[#03594d]">{t.name}</h4>
                  <span className="text-[10px] bg-[#82eda6] text-[#03594d] border-2 border-[#03594d] px-2 py-0.5 rounded-full uppercase font-black">Active</span>
                </div>
                <p className="text-xs font-medium text-[#03594d]/80 mt-1">{t.locality} &bull; {t.courts} Courts</p>
                <div className="mt-4 pt-3 border-t-2 border-[#03594d]/20 flex justify-between items-center text-xs font-bold">
                  <Link href="/turfs" className="text-[#03594d] hover:underline">
                    Preview
                  </Link>
                  <span className="text-[11px] text-[#03594d] font-bold">Publicly Searchable</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Disputes & Financial Operations */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-[#03594d]">Financial Disputes & Booking Refunds</h2>
              <p className="text-xs font-medium text-[#03594d]/80">Issue administrative overrides and automated payment refunds directly to players.</p>
            </div>
            <span className="text-xs text-[#03594d] bg-[#ffff94] border-2 border-[#03594d] shadow-maggie-sm px-3 py-1 rounded-full font-black">
              Gateway Refund Link Active
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
              <div className="grid grid-cols-12 px-4 py-3.5 items-center font-medium">
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
                        setNotification(`⚠️ Refund notice: ${data.message}`);
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
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-[#03594d] bg-[#f9f8f4] px-6 py-4 text-center text-xs font-bold text-[#03594d]/80">
        GoTurf Admin Control Suite &bull; Audit Logging Active
      </footer>
    </main>
  );
}
