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
    <section className="relative rounded-t-[50px] sm:rounded-t-[80px] bg-[#030303] text-white border-t border-[#5245F8]/30 px-6 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#F9B318]/15 text-[#F9B318] px-3.5 py-1 rounded-full border border-[#F9B318]/40 shadow-sm shadow-[#F9B318]/20 text-xs font-black uppercase tracking-wider mb-2 select-none">
              <span>📍 verified mumbai grounds</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              Live Arenas Near You
            </h2>
            <p className="text-neutral-400 font-medium text-xs sm:text-sm mt-1">
              Browse real-time slots, book continuous blocks, and check in with your match PIN.
            </p>
          </div>

          <Link
            href="/turfs"
            className="self-start sm:self-auto px-5 py-2.5 rounded-full bg-[#0c0c14] text-white border border-[#5245F8]/40 shadow-lg hover:border-[#F9B318]/60 hover:text-[#F9B318] transition-all text-xs font-black uppercase tracking-wider"
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
                className="bg-[#09090e] rounded-[32px] border border-[#5245F8]/30 shadow-xl hover:border-[#5245F8]/70 hover:shadow-[0_0_30px_rgba(82,69,248,0.25)] p-6 flex flex-col justify-between hover:translate-x-1 hover:translate-y-1 transition-all group"
              >
                <div>
                  {/* Top Header: Locality & Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-wider bg-[#0c0c14] text-[#F9B318] px-3 py-1 rounded-full border border-[#F9B318]/30 shadow-sm">
                      📍 {turf.region?.locality}
                    </span>
                    <span className="text-xs font-black bg-[#5245F8]/15 text-[#F9B318] px-2.5 py-1 rounded-full border border-[#5245F8]/40 shadow-sm">
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
                            className="relative w-12 h-12 rounded-2xl overflow-hidden border border-[#5245F8]/40 shadow-md bg-neutral-900 group-hover:scale-105 transition-transform"
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
                      <span className="text-xs font-black text-white block">
                        {courts.length} Active Courts
                      </span>
                      <span className="text-[11px] font-bold text-neutral-400 uppercase">
                        {sports.join(' • ')}
                      </span>
                    </div>
                  </div>

                  {/* Turf Name & Address */}
                  <h3 className="text-xl font-black text-white group-hover:text-[#F9B318] transition-colors tracking-tight">
                    {turf.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-1 font-medium">
                    {turf.address}
                  </p>

                  {/* Features Pills */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {turf.facilities?.slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-[#0c0c14] border border-white/10 text-neutral-300"
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* Perks callouts */}
                  <div className="mt-4 pt-3 border-t border-[#5245F8]/15 space-y-1 text-[11px] font-bold text-neutral-300">
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
                <div className="mt-6 pt-4 border-t border-[#5245F8]/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-black text-neutral-400 block tracking-wider">
                      Price
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-white">₹1,200</span>
                      <span className="text-xs font-bold text-neutral-400">/hr</span>
                    </div>
                  </div>

                  <Link
                    href={`/turfs/${turf.slug}/book`}
                    className="px-5 py-2.5 rounded-full bg-[#5245F8] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#5245F8]/30 hover:bg-[#4335e6] hover:scale-105 transition-all flex items-center gap-1.5"
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
