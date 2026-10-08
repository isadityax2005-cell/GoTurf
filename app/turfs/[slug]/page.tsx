import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTurfBySlug, DEMO_TURFS } from '@/lib/data/turfs';

interface TurfDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return DEMO_TURFS.map((turf) => ({
    slug: turf.slug,
  }));
}

const sportIcons: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  tennis: '🎾',
  pickleball: '🏓',
};

export default async function TurfDetailPage({ params }: TurfDetailPageProps) {
  const { slug } = await params;
  const turf = getTurfBySlug(slug);

  if (!turf) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-neutral-950/80">
        <div className="flex items-center gap-3">
          <Link href="/turfs" className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white">
            <span>&larr;</span>
            <span>All Mumbai Turfs</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Verified Venue
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl w-full mx-auto px-6 py-10 flex-1">
        {/* Hero Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-black border border-neutral-800 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                📍 {turf.region?.locality}, Mumbai
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {turf.name}
              </h1>
              <p className="text-sm text-neutral-400 mt-2 max-w-2xl">
                {turf.address}
              </p>
            </div>

            {/* Google Maps External Button (Free URL, no paid API keys) */}
            {turf.maps_url && (
              <a
                href={turf.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-2xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-white flex items-center gap-2 transition-all whitespace-nowrap shadow-sm"
              >
                <span>🗺️</span>
                <span>Open in Google Maps</span>
              </a>
            )}
          </div>
        </div>

        {/* Courts & Play Areas */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">Bookable Courts & Arenas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {turf.courts?.map((court) => (
              <div
                key={court.id}
                className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl">{sportIcons[court.sport] || '🏅'}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300">
                      {court.slot_minutes} Min Slots
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{court.name}</h3>
                  <p className="text-xs text-neutral-400 mt-1">Format: {court.format}</p>
                  {court.surface && (
                    <p className="text-xs text-neutral-400">Surface: {court.surface}</p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-semibold">Active & Live</span>
                  <Link
                    href={`/turfs/${turf.slug}/book?court=${court.id}`}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    Select Slot &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Facilities Grid */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">Facilities & Amenities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {turf.facilities.map((fac) => (
              <div
                key={fac}
                className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/60 text-xs text-neutral-300 flex items-center gap-2.5 font-medium"
              >
                <span className="text-emerald-400">✓</span>
                <span>{fac}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Venue Rules & Cancellation Policy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-neutral-900/30 border border-neutral-800/60">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <span>📋</span> Venue Rules
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {turf.rules || 'Standard sports footwear required. Please arrive 10 minutes prior to slot.'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-neutral-900/30 border border-neutral-800/60">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <span>🔄</span> Cancellation & Refund Policy
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {turf.cancellation_rule || 'Full refund up to 24 hours before match time.'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 px-6 py-6 text-center text-xs text-neutral-500">
        GoTurf &bull; Verified Owner Listing
      </footer>
    </main>
  );
}
