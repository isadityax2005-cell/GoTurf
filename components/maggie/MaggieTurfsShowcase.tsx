'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DEMO_TURFS } from '@/lib/data/turfs';

interface Props {
  selectedSport: string | null;
}

const sportIcons: Record<string, { src: string; name: string }> = {
  cricket: { src: '/icons/3d-cricket.jpg', name: 'Cricket' },
  football: { src: '/icons/3d-football.jpg', name: 'Football' },
  pickleball: { src: '/icons/3d-pickleball.jpg', name: 'Pickleball' },
  tennis: { src: '/icons/3d-tennis.jpg', name: 'Tennis' },
};

export default function MaggieTurfsShowcase({ selectedSport }: Props) {
  const filtered = DEMO_TURFS.filter((turf) => {
    if (turf.status !== 'approved') return false;
    if (!selectedSport) return true;
    return turf.courts?.some((c) => c.sport === selectedSport && c.is_active);
  });

  return (
    <section className="relative rounded-t-[50px] sm:rounded-t-[80px] bg-[#82eda6] text-[#03594d] border-t-2 border-[#03594d] px-6 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#ffff94] text-[#03594d] px-3.5 py-1 rounded-full border-2 border-[#03594d] shadow-maggie-sm text-xs font-black uppercase tracking-wider mb-2 select-none">
              <span>📍 verified mumbai grounds</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#03594d]">
              Live Arenas Near You
            </h2>
            <p className="text-[#03594d] font-bold text-xs sm:text-sm mt-1 opacity-80">
              Browse real-time slots, book continuous blocks, and check in with your match PIN.
            </p>
          </div>

          <Link
            href="/turfs"
            className="self-start sm:self-auto px-5 py-2.5 rounded-full bg-white text-[#03594d] border-2 border-[#03594d] shadow-maggie-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-xs font-black uppercase tracking-wider"
          >
            <span>View All Arenas ({DEMO_TURFS.length}) &rarr;</span>
          </Link>
        </div>

        {/* Turf Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((turf) => {
            const courts = turf.courts || [];
            const sports = Array.from(new Set(courts.map((c) => c.sport)));

            return (
              <div
                key={turf.id}
                className="bg-white rounded-[32px] border-2 border-[#03594d] shadow-maggie-xl p-6 flex flex-col justify-between hover:translate-x-1 hover:translate-y-1 hover:shadow-maggie transition-all"
              >
                <div>
                  {/* Top Header: Locality & Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-wider bg-[#ffff94] text-[#03594d] px-3 py-1 rounded-full border-2 border-[#03594d] shadow-maggie-sm">
                      📍 {turf.region?.locality}
                    </span>
                    <span className="text-xs font-black bg-[#aefbff] text-[#03594d] px-2.5 py-1 rounded-full border-2 border-[#03594d] shadow-maggie-sm">
                      ★ 4.9 (120+)
                    </span>
                  </div>

                  {/* 3D Sports Available at Venue */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex -space-x-2">
                      {sports.map((sp) => {
                        const icon = sportIcons[sp];
                        if (!icon) return null;
                        return (
                          <div
                            key={sp}
                            title={icon.name}
                            className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#03594d] shadow-maggie-sm bg-neutral-900"
                          >
                            <Image
                              src={icon.src}
                              alt={icon.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#03594d] block">
                        {courts.length} Active Courts
                      </span>
                      <span className="text-[11px] font-bold text-[#03594d]/70 uppercase">
                        {sports.join(' • ')}
                      </span>
                    </div>
                  </div>

                  {/* Turf Name & Address */}
                  <h3 className="text-xl font-black text-[#03594d] tracking-tight">
                    {turf.name}
                  </h3>
                  <p className="text-xs text-[#03594d]/70 mt-1 line-clamp-1 font-medium">
                    {turf.address}
                  </p>

                  {/* Features Pills */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {turf.facilities?.slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-[#f9f8f4] border border-[#03594d]/40 text-[#03594d]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* Maggie-style feature callouts */}
                  <div className="mt-4 pt-3 border-t-2 border-[#03594d]/15 space-y-1 text-[11px] font-bold text-[#03594d]">
                    <div className="flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>Continuous 2H & 3H+ slots open</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>🎟️</span>
                      <span>₹200 Token Advance &bull; Cash/UPI at Venue</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Footer: Price & CTA */}
                <div className="mt-6 pt-4 border-t-2 border-[#03594d] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-black text-[#03594d]/60 block tracking-wider">
                      Price
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-[#03594d]">₹1,200</span>
                      <span className="text-xs font-bold text-[#03594d]/70">/hr</span>
                    </div>
                  </div>

                  <Link
                    href={`/turfs/${turf.slug}/book`}
                    className="px-5 py-2.5 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider shadow-maggie-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1.5"
                  >
                    <span>Book Slot</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
