import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchTurfBySlug, DEMO_TURFS } from '@/lib/data/turfs';
import MaggieNavbar from '@/components/maggie/Navbar';
import MaggieFooter from '@/components/maggie/MaggieFooter';

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
  const turf = await fetchTurfBySlug(slug);

  if (!turf) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col justify-between selection:bg-[#ffff94] selection:text-[#03594d] relative overflow-hidden">
      <div className="relative z-10 flex flex-col flex-1">
        {/* Top Navbar */}
        <MaggieNavbar />

        {/* Back Link Bar */}
        <div className="bg-[#82eda6] px-6 py-3 border-b-2 border-[#03594d]/20">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link
              href="/turfs"
              className="inline-flex items-center gap-2 text-xs font-black text-[#03594d] hover:underline uppercase tracking-wider"
            >
              <span>&larr;</span>
              <span>All Mumbai Turfs</span>
            </Link>
            <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#ffff94] text-[#03594d] border border-[#03594d] shadow-maggie-sm">
              Verified Venue
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl w-full mx-auto px-6 py-10 flex-1">
          {/* Hero Banner */}
          <div className="p-8 sm:p-10 rounded-[32px] bg-[#f9f8f4] border-2 border-[#03594d] shadow-maggie-lg mb-8 relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <span className="text-xs font-black text-[#03594d] bg-[#ffff94] px-3 py-1 rounded-full border border-[#03594d] uppercase tracking-wider inline-block mb-3 shadow-maggie-sm">
                  📍 {turf.region?.locality}, Mumbai
                </span>
                <h1 className="text-3xl sm:text-5xl font-black text-[#03594d] tracking-tight leading-tight">
                  {turf.name}
                </h1>
                <p className="text-sm text-[#03594d]/80 mt-2 max-w-2xl font-semibold">
                  {turf.address}
                </p>
              </div>

              {/* Google Maps External Button */}
              {turf.maps_url && (
                <a
                  href={turf.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full bg-white hover:bg-[#ffff94] border-2 border-[#03594d] text-xs font-black text-[#03594d] flex items-center gap-2 transition-all whitespace-nowrap shadow-maggie hover:-translate-y-0.5 hover:shadow-maggie-lg"
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
              <h2 className="text-xl font-black text-[#03594d] tracking-tight uppercase">
                Bookable Courts & Arenas
              </h2>
              <span className="text-xs font-black text-[#03594d] bg-[#ffff94] px-3 py-1 rounded-full border border-[#03594d] shadow-maggie-sm">
                Instant Live Booking
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {turf.courts?.map((court) => {
                const icon = sportImages[court.sport];

                return (
                  <div
                    key={court.id}
                    className="p-6 rounded-[28px] bg-white border-2 border-[#03594d] shadow-maggie hover:-translate-y-0.5 hover:shadow-maggie-lg transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        {icon ? (
                          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#03594d] bg-white shadow-maggie-sm group-hover:scale-105 transition-transform">
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

                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#ffff94] text-[#03594d] border border-[#03594d] shadow-maggie-sm">
                          {court.slot_minutes} Min Slots
                        </span>
                      </div>

                      <h3 className="text-xl font-black text-[#03594d] group-hover:underline underline-offset-4 transition-all">
                        {court.name}
                      </h3>
                      <p className="text-xs text-[#03594d]/75 mt-1 font-semibold">
                        Format: <span className="text-[#03594d] font-black">{court.format}</span>
                      </p>
                      {court.surface && (
                        <p className="text-xs text-[#03594d]/75 font-semibold">
                          Surface: <span className="text-[#03594d] font-black">{court.surface}</span>
                        </p>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t-2 border-[#03594d]/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#03594d] animate-ping" />
                        <span className="text-xs text-[#03594d] font-black">
                          Active & Live
                        </span>
                      </div>

                      <Link
                        href={`/turfs/${turf.slug}/book?court=${court.id}`}
                        className="px-5 py-2.5 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-maggie-lg transition-all flex items-center gap-1.5"
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
            <h2 className="text-xl font-black text-[#03594d] mb-4 tracking-tight uppercase">
              Facilities & Amenities
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {turf.facilities.map((fac) => (
                <div
                  key={fac}
                  className="p-4 rounded-2xl bg-white border-2 border-[#03594d] shadow-maggie-sm text-xs text-[#03594d] flex items-center gap-2.5 font-bold"
                >
                  <span className="text-base font-black">✓</span>
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Venue Rules & Cancellation Policy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white border-2 border-[#03594d] shadow-maggie-sm">
              <h3 className="text-sm font-black text-[#03594d] mb-2 flex items-center gap-2 uppercase tracking-wider">
                <span>📋</span> Venue Rules
              </h3>
              <p className="text-xs text-[#03594d]/80 leading-relaxed font-semibold">
                {turf.rules || 'Standard sports footwear required. Please arrive 10 minutes prior to slot.'}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border-2 border-[#03594d] shadow-maggie-sm">
              <h3 className="text-sm font-black text-[#03594d] mb-2 flex items-center gap-2 uppercase tracking-wider">
                <span>🔄</span> Cancellation & Refund Policy
              </h3>
              <p className="text-xs text-[#03594d]/80 leading-relaxed font-semibold">
                {turf.cancellation_rule || 'Full refund up to 24 hours before match time.'}
              </p>
            </div>
          </div>
        </div>

        {/* Maggie Footer */}
        <MaggieFooter />
      </div>
    </main>
  );
}

export default function TurfDetailPage({ params }: TurfDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#82eda6] text-[#03594d] flex items-center justify-center text-sm font-black">
          Loading venue details...
        </div>
      }
    >
      <TurfDetailContent params={params} />
    </Suspense>
  );
}
