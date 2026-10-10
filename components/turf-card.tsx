import Link from 'next/link';
import Image from 'next/image';
import type { Turf } from '@/types/database';
import SpotlightCard from '@/components/ui/SpotlightCard';

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
  // Extract distinct sports available at this turf
  const sports = Array.from(new Set(turf.courts?.map((c) => c.sport) || []));

  return (
    <SpotlightCard
      spotlightColor="rgba(255, 255, 148, 0.4)"
      className="group rounded-[32px] bg-white border-2 border-[#03594d] shadow-maggie text-[#03594d] hover:-translate-y-1 hover:shadow-maggie-lg transition-all flex flex-col justify-between overflow-hidden"
    >
      {/* Top Banner Area */}
      <div className="p-6 pb-4 border-b-2 border-[#03594d] bg-[#f9f8f4]">
        <div className="flex justify-between items-start mb-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#ffff94] text-[#03594d] border border-[#03594d] shadow-maggie-sm">
            📍 {turf.region?.locality || 'Mumbai'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#82eda6] text-[#03594d] border border-[#03594d] shadow-maggie-sm">
            ★ 4.9 Verified
          </span>
        </div>

        <h3 className="text-xl font-black text-[#03594d] tracking-tight group-hover:underline underline-offset-4 transition-all">
          {turf.name}
        </h3>
        <p className="text-xs font-semibold text-[#03594d]/75 mt-1 line-clamp-1">
          {turf.address}
        </p>
      </div>

      {/* Details Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
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
