import Link from 'next/link';
import type { Turf } from '@/types/database';

interface TurfCardProps {
  turf: Turf;
}

const sportIcons: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  tennis: '🎾',
  pickleball: '🏓',
};

export default function TurfCard({ turf }: TurfCardProps) {
  // Extract distinct sports available at this turf
  const sports = Array.from(new Set(turf.courts?.map((c) => c.sport) || []));

  return (
    <div className="group rounded-3xl bg-neutral-900/60 border border-neutral-800/80 hover:border-emerald-500/40 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:shadow-emerald-950/20">
      {/* Top Banner / Image Area */}
      <div className="relative h-44 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black p-5 flex flex-col justify-between border-b border-neutral-800/60">
        <div className="flex justify-between items-start">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
            Verified Partner
          </span>
          {turf.is_demo && (
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-neutral-800/80 text-neutral-400 border border-neutral-700">
              Demo Venue
            </span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <span>📍</span>
            <span>{turf.region?.locality || 'Mumbai'}</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
            {turf.name}
          </h3>
        </div>
      </div>

      {/* Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Sports Available Badges */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {sports.map((sport) => (
              <span
                key={sport}
                className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 font-medium flex items-center gap-1"
              >
                <span>{sportIcons[sport] || '🏅'}</span>
                <span className="capitalize">{sport}</span>
              </span>
            ))}
          </div>

          {/* Facilities Preview */}
          <div className="flex flex-wrap gap-2 text-[11px] text-neutral-400 mb-5">
            {turf.facilities.slice(0, 3).map((f) => (
              <span key={f} className="inline-flex items-center gap-1">
                <span className="text-emerald-400">&bull;</span> {f}
              </span>
            ))}
            {turf.facilities.length > 3 && (
              <span className="text-neutral-500">+{turf.facilities.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Footer with Starting Price & CTA */}
        <div className="pt-4 border-t border-neutral-800/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
              Slots From
            </span>
            <span className="text-base font-extrabold text-white">
              ₹800 <span className="text-xs font-normal text-neutral-400">/ hr</span>
            </span>
          </div>

          <Link
            href={`/turfs/${turf.slug}`}
            className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-emerald-400 transition-colors shadow-sm"
          >
            View Live Slots &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
