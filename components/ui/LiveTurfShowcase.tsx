'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import GlassIcon from './GlassIcon';
import SpotlightCard from './SpotlightCard';
import { DEMO_TURFS } from '@/lib/data/turfs';
import type { SportType } from '@/types/database';

interface Props {
  selectedSport: string | null;
}

const sportIconMap: Record<string, { src: string; name: string }> = {
  cricket: { src: '/icons/3d-cricket.jpg', name: 'Cricket' },
  football: { src: '/icons/3d-football.jpg', name: 'Football' },
  pickleball: { src: '/icons/3d-pickleball.jpg', name: 'Pickleball' },
  tennis: { src: '/icons/3d-tennis.jpg', name: 'Tennis' },
};

export default function LiveTurfShowcase({ selectedSport }: Props) {
  // Filter venues based on selected 3D sport category
  const filteredTurfs = DEMO_TURFS.filter((turf) => {
    if (turf.status !== 'approved') return false;
    if (!selectedSport) return true;
    return turf.courts?.some((c) => c.sport === selectedSport && c.is_active);
  });

  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 mb-2">
            <span>⚡ Live Mumbai Slots</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Featured Arenas with Verified Schedules
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">
            Real-time court availability &bull; Instant 10-minute hold &bull; ₹200 token advance
          </p>
        </div>

        <Link
          href="/turfs"
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <span>View all Mumbai venues ({DEMO_TURFS.length})</span>
          <span>&rarr;</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTurfs.map((turf) => {
          const courts = turf.courts || [];
          const sports = Array.from(new Set(courts.map((c) => c.sport)));

          return (
            <SpotlightCard
              key={turf.id}
              className="p-6 flex flex-col justify-between group hover:border-emerald-500/50"
            >
              <div>
                {/* Header: Locality & Rating */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    📍 {turf.region?.locality}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white bg-neutral-800/80 px-2.5 py-1 rounded-full border border-white/5">
                    <span className="text-amber-400">★</span>
                    <span>4.9</span>
                    <span className="text-neutral-500 font-normal">(120+)</span>
                  </div>
                </div>

                {/* 3D Sports Icons Available at Venue */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex -space-x-2">
                    {sports.map((sp) => {
                      const icon = sportIconMap[sp];
                      if (!icon) return null;
                      return (
                        <div
                          key={sp}
                          title={icon.name}
                          className="relative w-11 h-11 rounded-xl overflow-hidden border-2 border-neutral-900 bg-neutral-800 shadow-md transform transition-transform group-hover:scale-105"
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
                  <div className="text-xs text-neutral-400">
                    <span className="font-semibold text-neutral-200">
                      {courts.length} Active Courts
                    </span>
                    <span className="block text-[11px] text-neutral-500">
                      {sports.join(' &bull; ')}
                    </span>
                  </div>
                </div>

                {/* Turf Name & Address */}
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {turf.name}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                  {turf.address}
                </p>

                {/* Facilities Pills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {turf.facilities?.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-neutral-800/50 border border-white/5 text-neutral-300"
                    >
                      {f}
                    </span>
                  ))}
                  {turf.facilities && turf.facilities.length > 3 && (
                    <span className="text-[10px] text-neutral-500 self-center">
                      +{turf.facilities.length - 3} more
                    </span>
                  )}
                </div>

                {/* Feature Tags */}
                <div className="mt-4 space-y-1.5 border-t border-neutral-800/60 pt-3">
                  <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                    <span>⚡ Continuous 2H & 3H+ slots available</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-cyan-300 font-medium">
                    <span>🎟️ ₹200 Token Advance &bull; Cash/UPI at Venue</span>
                  </div>
                </div>
              </div>

              {/* Bottom Price & Action */}
              <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                    Starting from
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-white">₹1,200</span>
                    <span className="text-xs text-neutral-400">/hr</span>
                  </div>
                </div>

                <Link
                  href={`/turfs/${turf.slug}/book`}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-xs font-black shadow-md shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-1.5"
                >
                  <span>Select Slot</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </section>
  );
}
