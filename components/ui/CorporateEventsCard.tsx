'use client';

import React from 'react';
import Link from 'next/link';
import GlassIcon from './GlassIcon';

export default function CorporateEventsCard() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-6">
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-neutral-900/60 to-emerald-950/40 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_0_50px_rgba(245,158,11,0.1)]">
        {/* Glow ambient circle */}
        <div className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-left">
            <GlassIcon
              src="/icons/3d-trophy.jpg"
              alt="Championship Trophy"
              size="lg"
              glowColor="amber"
              floating
            />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] uppercase font-bold text-amber-300 tracking-wider mb-2">
                <span>🏆 Corporate Leagues & Tournaments</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Hosting a Whole Venue Tournament or Private Match?
              </h3>
              <p className="text-neutral-300 text-xs sm:text-sm mt-1 max-w-xl">
                Get dedicated multi-court blocks, custom tournament fixtures, live scoreboard assistance, and VIP lounge access across premier Mumbai turfs.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/contact"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-black shadow-lg shadow-amber-500/20 transition-all text-center whitespace-nowrap hover:scale-105"
            >
              Inquire Corporate Booking
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
