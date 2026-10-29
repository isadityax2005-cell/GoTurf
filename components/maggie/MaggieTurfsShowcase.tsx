'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DEMO_TURFS } from '@/lib/data/turfs';
import { gsap } from '@/lib/gsap';
import SpotlightCard from '@/components/ui/SpotlightCard';
import {
  getTurfPhotoUrl,
  getIllustrativeSportFallback,
  isIllustrativePhotoUrl,
} from '@/lib/utils/turf-photo';

import type { Turf } from '@/types/database';

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
  const showcaseRef = useRef<HTMLElement>(null);
  const [turfs, setTurfs] = useState<Turf[]>(DEMO_TURFS);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadLiveTurfs() {
      try {
        const res = await fetch('/api/turfs');
        const data = await res.json();
        if (data.success && Array.isArray(data.turfs) && data.turfs.length > 0) {
          setTurfs(data.turfs);
        }
      } catch (err) {
        console.warn('Failed to load live turfs from Supabase, using seed:', err);
      }
    }
    loadLiveTurfs();
  }, []);

  const filtered = turfs.filter((turf) => {
    if (turf.status !== 'approved') return false;
    if (!selectedSport) return true;
    return turf.courts?.some((c) => c.sport === selectedSport && c.is_active);
  });

  useEffect(() => {
    if (!showcaseRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.turf-showcase-card', {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: showcaseRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });
    }, showcaseRef);

    return () => ctx.revert();
  }, [selectedSport]);

  return (
    <section
      ref={showcaseRef}
      className="relative rounded-t-[50px] sm:rounded-t-[80px] bg-[#82eda6] text-[#03594d] border-t-2 border-[#03594d] px-6 py-16 sm:py-24"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#ffff94] text-[#03594d] px-4 py-1 rounded-full border-2 border-[#03594d] shadow-maggie-sm text-xs font-black uppercase tracking-wider mb-3 select-none">
              <span>📍 mumbai grounds &amp; demo previews</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#03594d]">
              Live Arenas Near You
            </h2>
            <p className="text-[#03594d]/80 font-semibold text-xs sm:text-sm mt-1">
              Browse real-time slots, book continuous blocks, and check in with your match PIN.
            </p>
          </div>

          <Link
            href="/turfs"
            className="self-start sm:self-auto px-6 py-3 rounded-full bg-white text-[#03594d] border-2 border-[#03594d] shadow-maggie hover:bg-[#ffff94] hover:-translate-y-0.5 hover:shadow-maggie-lg transition-all text-xs font-black uppercase tracking-wider"
          >
            <span>View All Arenas ({turfs.length}) &rarr;</span>
          </Link>
        </div>

        {/* Turf Cards Grid with adapted SpotlightCard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((turf) => {
            const courts = turf.courts || [];
            const sports = Array.from(new Set(courts.map((c) => c.sport)));
            const primarySport = sports[0] || 'cricket';
            const fallbackUrl = getIllustrativeSportFallback(primarySport);
            const resolvedUrl = getTurfPhotoUrl(turf.photos?.[0], primarySport);
            const photoUrl = failedImages[turf.id] ? fallbackUrl : resolvedUrl;
            const isIllustrative =
              turf.is_demo || Boolean(failedImages[turf.id]) || isIllustrativePhotoUrl(photoUrl);

            return (
              <div key={turf.id} className="turf-showcase-card h-full">
                <SpotlightCard
                  spotlightColor="rgba(255, 255, 148, 0.45)"
                  className="h-full bg-white text-[#03594d] overflow-hidden flex flex-col justify-between"
                >
                  {/* Photo Header */}
                  <div className="relative w-full h-44 sm:h-48 overflow-hidden border-b-2 border-[#03594d] bg-[#03594d]/10">
                    <Image
                      src={photoUrl}
                      alt={isIllustrative ? `${turf.name} — illustrative court preview` : turf.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [turf.id]: true }))
                      }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-[#ffff94] text-[#03594d] px-3 py-1 rounded-full border border-[#03594d] shadow-maggie-sm">
                        📍 {turf.region?.locality}
                      </span>
                      <span className="text-[10px] font-black bg-[#82eda6] text-[#03594d] px-2.5 py-0.5 rounded-full border border-[#03594d] shadow-maggie-sm">
                        {turf.is_demo ? '🎨 Demo • Illustrative' : '★ Verified Venue'}
                      </span>
                    </div>

                    {(turf.photos?.length || 0) > 1 && (
                      <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-black border border-white/20">
                        📸 {turf.photos?.length} {isIllustrative ? 'Previews' : 'Photos'}
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      {/* 3D Sports Available at Venue */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex -space-x-2">
                          {sports.map((sp) => {
                            const icon = sportIcons[sp];
                            if (!icon) return null;
                            return (
                              <div
                                key={sp}
                                title={icon.name}
                                className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#03594d] shadow-maggie-sm bg-white hover:scale-105 transition-transform"
                              >
                                <Image
                                  src={icon.src}
                                  alt={icon.name}
                                  fill
                                  sizes="48px"
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
                      <p className="text-xs text-[#03594d]/75 mt-1 line-clamp-1 font-semibold">
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

                      {/* Perks callouts */}
                      <div className="mt-4 pt-3 border-t-2 border-[#03594d]/10 space-y-1.5 text-[11px] font-bold text-[#03594d]">
                        <div className="flex items-center gap-1.5">
                          <span>⚡</span>
                          <span>Continuous 2H &amp; 3H+ slots open</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>🎟️</span>
                          <span>₹200 Token Advance &bull; Cash/UPI at Venue</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Card Footer: Price & CTA */}
                    <div className="mt-6 pt-4 border-t-2 border-[#03594d]/15 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-black text-[#03594d]/70 block tracking-wider">
                          Price
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-[#03594d]">₹1,200</span>
                          <span className="text-xs font-bold text-[#03594d]/70">/hr</span>
                        </div>
                      </div>

                      <Link
                        href={`/turfs/${turf.slug}/book`}
                        className="px-5 py-2.5 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-maggie-lg transition-all flex items-center gap-1.5"
                      >
                        <span>Book Slot</span>
                        <span>&rarr;</span>
                      </Link>
                    </div>
                  </div>
                </SpotlightCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
