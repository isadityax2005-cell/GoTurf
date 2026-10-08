import Link from 'next/link';

export default function AdminDashboardPage() {
  const pendingTurfs = [
    {
      id: 'pending-1',
      name: 'Juhu Beach Sports Arena',
      owner: 'Sameer Kulkarni',
      phone: '+91 98200 99887',
      locality: 'Juhu, Mumbai',
      submittedAt: 'Today, 2:15 PM',
      status: 'pending',
    },
  ];

  const approvedTurfs = [
    { name: 'Bandra Turf Arena [Demo]', locality: 'Bandra West', courts: 2, status: 'approved' },
    { name: 'Powai Smash Club [Demo]', locality: 'Powai', courts: 2, status: 'approved' },
    { name: 'Andheri Sports Hub [Demo]', locality: 'Andheri East', courts: 2, status: 'approved' },
  ];

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

        {/* Verification Queue Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Verification Queue</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                1 Pending
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {pendingTurfs.map((turf) => (
              <div
                key={turf.id}
                className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-semibold text-white text-sm">{turf.name}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Owner: {turf.owner} &bull; {turf.phone} &bull; {turf.locality}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1">Submitted: {turf.submittedAt}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 font-medium">
                    Inspect Evidence
                  </button>
                  <button className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold">
                    Reject
                  </button>
                  <button className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-md shadow-emerald-500/20">
                    Approve Venue
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Turfs Quick Overview */}
        <div>
          <h2 className="text-base font-bold text-white mb-4">Live Approved Turfs (Mumbai)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {approvedTurfs.map((t) => (
              <div key={t.name} className="p-4 rounded-2xl bg-neutral-900/30 border border-neutral-800/70">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-sm text-white">{t.name}</h4>
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">Active</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">{t.locality} &bull; {t.courts} Courts</p>
                <div className="mt-4 pt-3 border-t border-neutral-800/60 flex justify-between items-center text-xs">
                  <button className="text-neutral-400 hover:text-white">View Bookings</button>
                  <button className="text-rose-400 hover:text-rose-300">Hide Turf</button>
                </div>
              </div>
            ))}
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
