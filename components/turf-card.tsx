import Link from 'next/link';
import Image from 'next/image';
import type { Turf } from '@/types/database';

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
    <div className="group rounded-[32px] bg-[#09090e] border border-[#5245F8]/30 shadow-xl hover:border-[#5245F8]/70 hover:shadow-[0_0_30px_rgba(82,69,248,0.25)] hover:translate-x-1 hover:translate-y-1 transition-all overflow-hidden flex flex-col justify-between">
      {/* Top Banner Area */}
      <div className="p-6 pb-4 border-b border-[#5245F8]/20 bg-[#0c0c14]">
        <div className="flex justify-between items-start mb-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#07070c] text-[#F9B318] border border-[#F9B318]/40 shadow-sm">
            📍 {turf.region?.locality || 'Mumbai'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#5245F8]/15 text-[#F9B318] border border-[#5245F8]/40">
            ★ 4.9 Verified
          </span>
        </div>

        <h3 className="text-xl font-black text-white tracking-tight group-hover:text-[#F9B318] transition-colors">
          {turf.name}
        </h3>
        <p className="text-xs font-medium text-neutral-400 mt-1 line-clamp-1">
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
                    className="relative w-9 h-9 rounded-xl overflow-hidden border border-[#5245F8]/40 shadow-md bg-neutral-900 group-hover:scale-105 transition-transform"
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
            <span className="text-xs font-bold uppercase text-neutral-300 tracking-wider">
              {sports.join(' • ')}
            </span>
          </div>

          {/* Facilities Preview */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {turf.facilities.slice(0, 3).map((f) => (
              <span
                key={f}
                className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-[#0c0c14] border border-white/10 text-neutral-300"
              >
                {f}
              </span>
            ))}
            {turf.facilities.length > 3 && (
              <span className="text-[10px] font-medium text-neutral-500 self-center">
                +{turf.facilities.length - 3} more
              </span>
            )}
          </div>

          {/* Quick Perks */}
          <div className="space-y-1 text-[11px] font-bold text-neutral-300 border-t border-[#5245F8]/15 pt-3">
            <div>⚡ 2H & 3H continuous sessions open</div>
            <div>🎟️ ₹200 Token Advance &bull; Cash on gate</div>
          </div>
        </div>

        {/* Footer with Starting Price & CTA */}
        <div className="mt-5 pt-4 border-t border-[#5245F8]/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
              Slots From
            </span>
            <span className="text-lg font-black text-white">
              ₹800 <span className="text-xs font-medium text-neutral-400">/ hr</span>
            </span>
          </div>

          <Link
            href={`/turfs/${turf.slug}`}
            className="px-5 py-2.5 rounded-full bg-[#5245F8] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#5245F8]/30 hover:bg-[#4335e6] hover:scale-105 transition-all"
          >
            View Slots &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
