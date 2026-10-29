'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Turf } from '@/types/database';
import SpotlightCard from '@/components/ui/SpotlightCard';
import {
  resolveTurfDisplayPhoto,
} from '@/lib/utils/turf-photo';

interface TurfCardProps {
  turf: Turf;
}

const sportImages: Record<string, string> = {
  cricket: '/icons/3d-cricket.jpg',
  football: '/icons/3d-football.jpg',
  tennis: '/icons/3d-tennis.jpg',
  pickleball: '/icons/3d-pickleball.jpg',
};

export default function TurfCard({ turf }: TurfCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  // Extract distinct sports available at this turf
  const sports = Array.from(new Set(turf.courts?.map((c) => c.sport) || []));
  const photoInfo = resolveTurfDisplayPhoto(turf, imageFailed);
  const photosCount = turf.photos?.length || 0;

  return (
    <SpotlightCard
      spotlightColor="rgba(255, 255, 148, 0.4)"
      className="group rounded-[32px] bg-white border-2 border-[#03594d] shadow-maggie text-[#03594d] hover:-translate-y-1 hover:shadow-maggie-lg transition-all flex flex-col justify-between overflow-hidden"
    >
      {/* Venue Photo Banner */}
      <div className="relative w-full aspect-[16/9] overflow-hidden border-b-2 border-[#03594d] bg-[#03594d]/10">
        <Image
          src={photoInfo.photoUrl}
          priority={turf.slug === 'bandra-turf-arena-demo'}
          alt={photoInfo.altText}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImageFailed(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25 pointer-events-none" />

        {/* Badges over Image */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start gap-1.5 flex-wrap pointer-events-none">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#ffff94] text-[#03594d] border border-[#03594d] shadow-maggie-sm">
            📍 {turf.region?.locality || 'Mumbai'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#82eda6] text-[#03594d] border border-[#03594d] shadow-maggie-sm">
            {photoInfo.badgeLabel}
          </span>
        </div>

        {/* Photos Count Pill */}
        {photosCount > 1 && !photoInfo.isUnavailable && (
          <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-black border border-white/20">
            📸 {photosCount} {photoInfo.isIllustrative ? 'Previews' : 'Photos'}
          </div>
        )}
      </div>

      {/* Title Header Area */}
      <div className="p-5 sm:p-6 pb-3 sm:pb-4 border-b-2 border-[#03594d] bg-[#f9f8f4]">
        <h3 className="text-lg sm:text-xl font-black text-[#03594d] tracking-tight group-hover:underline underline-offset-4 transition-all">
          {turf.name}
        </h3>
        <p className="text-xs font-semibold text-[#03594d]/75 mt-1 line-clamp-1">
          {turf.address}
        </p>
      </div>

      {/* Details Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Sports Available 3D Badges */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-1.5">
              {sports.map((sport) => {
                const img = sportImages[sport];
                if (!img) return null;
                return (
                  <div
                    key={sport}
                    title={sport}
                    className="relative w-9 h-9 rounded-xl overflow-hidden border-2 border-[#03594d] shadow-maggie-sm bg-white group-hover:scale-105 transition-transform"
                  >
                    <Image
                      src={img}
                      alt={sport}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </div>
                );
              })}
            </div>
            <span className="text-xs font-black uppercase text-[#03594d] tracking-wider">
              {sports.join(' • ')}
            </span>
          </div>

          {/* Facilities Preview */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {turf.facilities.slice(0, 3).map((f) => (
              <span
                key={f}
                className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-[#f9f8f4] border border-[#03594d]/40 text-[#03594d]"
              >
                {f}
              </span>
            ))}
            {turf.facilities.length > 3 && (
              <span className="text-[10px] font-bold text-[#03594d]/60 self-center">
                +{turf.facilities.length - 3} more
              </span>
            )}
          </div>

          {/* Quick Perks */}
          <div className="space-y-1 text-[11px] font-bold text-[#03594d] border-t-2 border-[#03594d]/10 pt-3">
            <div>⚡ 2H & 3H continuous sessions open</div>
            <div>🎟️ ₹200 Token Advance &bull; Cash on gate</div>
          </div>
        </div>

        {/* Footer with Starting Price & CTA */}
        <div className="mt-5 pt-4 border-t-2 border-[#03594d]/15 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#03594d]/70 font-black block">
              Slots From
            </span>
            <span className="text-lg font-black text-[#03594d]">
              ₹800 <span className="text-xs font-bold text-[#03594d]/70">/ hr</span>
            </span>
          </div>

          <Link
            href={`/turfs/${turf.slug}`}
            className="px-5 py-2.5 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-maggie-lg transition-all"
          >
            View Slots &rarr;
          </Link>
        </div>
      </div>
    </SpotlightCard>
  );
}
