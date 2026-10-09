import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

const sportImages: Record<string, { src: string; name: string }> = {
  cricket: { src: '/icons/3d-cricket.jpg', name: 'Cricket' },
  football: { src: '/icons/3d-football.jpg', name: 'Football' },
  tennis: { src: '/icons/3d-tennis.jpg', name: 'Tennis' },
  pickleball: { src: '/icons/3d-pickleball.jpg', name: 'Pickleball' },
};

async function TurfDetailContent({ params }: TurfDetailPageProps) {
  const { slug } = await params;
  const turf = getTurfBySlug(slug);

  if (!turf) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#030303] text-neutral-100 flex flex-col justify-between selection:bg-[#F9B318] selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-[#5245F8]/20 px-6 py-4 flex items-center justify-between backdrop-blur-xl sticky top-0 z-50 bg-[#030303]/90">
        <div className="flex items-center gap-3">
          <Link
            href="/turfs"
            className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-[#F9B318] transition-colors"
          >
            <span>&larr;</span>
            <span>All Mumbai Turfs</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#F9B318]/15 text-[#F9B318] border border-[#F9B318]/40 shadow-sm shadow-[#F9B318]/20">
            Verified Venue
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl w-full mx-auto px-6 py-10 flex-1">
        {/* Hero Banner */}
        <div className="p-8 sm:p-10 rounded-[32px] bg-gradient-to-br from-[#0c0c14] via-[#08080c] to-[#030303] border border-[#5245F8]/30 shadow-[0_0_60px_rgba(82,69,248,0.15)] mb-8 relative overflow-hidden">
          {/* Subtle Electric Violet Ambient Radial Glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 bg-[#5245F8]/15 rounded-full blur-[100px]" />

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <span className="text-xs font-black text-[#F9B318] uppercase tracking-wider block mb-2">
                📍 {turf.region?.locality}, Mumbai
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {turf.name}
              </h1>
              <p className="text-sm text-neutral-400 mt-2 max-w-2xl font-medium">
                {turf.address}
              </p>
            </div>

            {/* Google Maps External Button */}
            {turf.maps_url && (
              <a
                href={turf.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-full bg-[#11111a] hover:bg-[#181824] border border-[#5245F8]/40 text-xs font-bold text-white flex items-center gap-2 transition-all whitespace-nowrap shadow-md shadow-black/60 hover:border-[#F9B318]/60 hover:text-[#F9B318]"
              >
                <span>🗺️</span>
                <span>Open in Google Maps</span>
              </a>
            )}
          </div>
        </div>

        {/* Courts & Play Areas */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white tracking-tight">
              Bookable Courts & Arenas
            </h2>
            <span className="text-xs font-bold text-[#F9B318]">
              Instant Live Booking Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {turf.courts?.map((court) => {
              const icon = sportImages[court.sport];

              return (
                <div
                  key={court.id}
                  className="p-6 rounded-[28px] bg-[#09090e] border border-[#5245F8]/25 hover:border-[#5245F8]/60 transition-all shadow-xl shadow-black/80 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      {icon ? (
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-[#5245F8]/40 bg-[#030303] shadow-md shadow-[#5245F8]/20 group-hover:scale-105 transition-transform">
                          <Image
                            src={icon.src}
                            alt={icon.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-2xl">🏅</span>
                      )}

                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#5245F8]/15 text-[#F9B318] border border-[#5245F8]/40">
                        {court.slot_minutes} Min Slots
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white group-hover:text-[#F9B318] transition-colors">
                      {court.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 font-medium">
                      Format: <span className="text-neutral-200">{court.format}</span>
                    </p>
                    {court.surface && (
                      <p className="text-xs text-neutral-400 font-medium">
                        Surface: <span className="text-neutral-200">{court.surface}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#5245F8]/15 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#5245F8] animate-ping" />
                      <span className="text-xs text-[#F9B318] font-bold">
                        Active & Live
                      </span>
                    </div>

                    <Link
                      href={`/turfs/${turf.slug}/book?court=${court.id}`}
                      className="px-5 py-2.5 rounded-full bg-[#5245F8] hover:bg-[#4335e6] text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-[#5245F8]/30 hover:scale-105 flex items-center gap-1.5"
                    >
                      <span>Select Slot</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Facilities Grid */}
        <div className="mb-10">
          <h2 className="text-xl font-black text-white mb-4 tracking-tight">
            Facilities & Amenities
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {turf.facilities.map((fac) => (
              <div
                key={fac}
                className="p-4 rounded-2xl bg-[#09090e] border border-white/5 text-xs text-neutral-300 flex items-center gap-2.5 font-medium hover:border-[#5245F8]/30 transition-colors"
              >
                <span className="text-[#F9B318] font-black">✓</span>
                <span>{fac}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Venue Rules & Cancellation Policy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[#09090e] border border-[#5245F8]/20">
            <h3 className="text-sm font-black text-[#F9B318] mb-2 flex items-center gap-2 uppercase tracking-wider">
              <span>📋</span> Venue Rules
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
              {turf.rules || 'Standard sports footwear required. Please arrive 10 minutes prior to slot.'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#09090e] border border-[#5245F8]/20">
            <h3 className="text-sm font-black text-[#F9B318] mb-2 flex items-center gap-2 uppercase tracking-wider">
              <span>🔄</span> Cancellation & Refund Policy
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
              {turf.cancellation_rule || 'Full refund up to 24 hours before match time.'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Status & Compliance */}
      <footer className="border-t border-[#5245F8]/20 px-6 py-8 text-center text-xs text-neutral-500 space-y-4 bg-[#030303]">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-neutral-400">
          <Link href="/terms" className="hover:text-[#F9B318] transition-colors">
            Terms of Service
          </Link>
          <span>&bull;</span>
          <Link href="/privacy" className="hover:text-[#F9B318] transition-colors">
            Privacy Policy
          </Link>
          <span>&bull;</span>
          <Link href="/refund-policy" className="hover:text-[#F9B318] transition-colors">
            Cancellation & Refund Policy
          </Link>
          <span>&bull;</span>
          <Link href="/contact" className="hover:text-[#F9B318] transition-colors">
            Contact Us
          </Link>
        </div>
        <p>GoTurf Platform &copy; 2026. Live in Mumbai &bull; Carter Road, Bandra West &bull; support@goturf.in</p>
      </footer>
    </main>
  );
}

export default function TurfDetailPage({ params }: TurfDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#030303] text-neutral-400 flex items-center justify-center text-xs">
          Loading venue details...
        </div>
      }
    >
      <TurfDetailContent params={params} />
    </Suspense>
  );
}
