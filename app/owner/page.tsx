import Link from 'next/link';

export default function OwnerDashboardPage() {
  // Demo turf fixture representing Owner Rohan Mehta's Bandra venue
  const ownerTurf = {
    name: 'Bandra Turf Arena [Demo]',
    locality: 'Bandra West, Mumbai',
    status: 'approved',
    courts: [
      { name: 'Court 1 - Box Cricket', sport: 'Box Cricket', hours: '06:00 - 23:00', price: '₹1,200 - ₹1,800/hr' },
      { name: 'Arena B - Football', sport: '5-a-side Football', hours: '06:00 - 23:00', price: '₹1,400 - ₹2,000/hr' },
    ],
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-neutral-950/80">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-black text-sm">
              GT
            </div>
            <span className="font-bold text-lg tracking-tight text-white">GoTurf</span>
          </Link>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Owner Dashboard
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-neutral-400 hidden sm:inline">Rohan Mehta (Bandra Turf Arena)</span>
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
        {/* Welcome Banner */}
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {ownerTurf.name}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              📍 {ownerTurf.locality} &bull; Status: <span className="text-emerald-400 font-semibold uppercase">{ownerTurf.status}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/owner/new-turf"
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors"
            >
              + Register New Turf
            </Link>
            <Link
              href="/owner/availability"
              className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              + Block Offline Time
            </Link>
          </div>
        </div>

        {/* Courts Section */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-white mb-4">Your Courts & Availability</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ownerTurf.courts.map((court) => (
              <div
                key={court.name}
                className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-white text-base">{court.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-medium">
                    {court.sport}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">🕒 Operating Hours: {court.hours}</p>
                <p className="text-xs text-emerald-400 mt-1 font-medium">💰 Rates: {court.price}</p>
                
                <div className="mt-4 pt-3 border-t border-neutral-800/60 flex gap-2">
                  <button className="text-xs text-neutral-300 hover:text-white px-2 py-1 rounded bg-neutral-800/60">
                    Edit Hours
                  </button>
                  <button className="text-xs text-neutral-300 hover:text-white px-2 py-1 rounded bg-neutral-800/60">
                    Price Rules
                  </button>
                  <button className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded bg-emerald-500/10">
                    View Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Isolation Notice */}
        <div className="p-4 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 text-xs text-neutral-400">
          🔒 <strong className="text-white">Multi-Tenant Isolation (Phase 2):</strong> Row Level Security (RLS) ensures that as a turf owner, you can only see and manage your own venue data. Venues in Powai or Andheri are completely inaccessible to your account.
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 px-6 py-4 text-center text-xs text-neutral-600">
        GoTurf Owner Partner Portal &copy; 2026
      </footer>
    </main>
  );
}
