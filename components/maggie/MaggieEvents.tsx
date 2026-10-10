'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function MaggieEvents() {
  return (
    <section className="relative rounded-t-[50px] sm:rounded-t-[80px] bg-[#050508] text-white border-t border-[#5245F8]/30 px-6 py-20 sm:py-28 overflow-hidden">
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute -right-20 top-1/4 w-80 h-80 bg-[#5245F8]/15 rounded-full blur-[100px]" />
      <div className="pointer-events-none absolute -left-20 bottom-1/4 w-80 h-80 bg-[#F9B318]/10 rounded-full blur-[100px]" />

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
        <div className="flex-1 text-center md:text-left">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-[#F9B318]/15 text-[#F9B318] px-4 py-1 rounded-full border border-[#F9B318]/40 shadow-sm shadow-[#F9B318]/20 text-xs font-black uppercase tracking-wider mb-4 select-none">
            <span>🏆 corporate & tournament booking</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-[1.05]">
            Turn Weekend Chaos into{' '}
            <span className="text-[#F9B318]">Championships</span> with GoTurf!
          </h2>

          <p className="mt-4 text-neutral-300 font-medium text-sm sm:text-base max-w-xl leading-relaxed">
            Hosting company cups, birthday matches, or multi-court box cricket leagues? Get whole-venue block holds, referee assistance, and custom tournament fixtures across premier Mumbai turfs.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              href="/contact"
              className="px-8 py-4 rounded-full bg-[#5245F8] text-white text-xs font-black uppercase tracking-wider shadow-[0_0_30px_rgba(82,69,248,0.4)] hover:bg-[#4335e6] hover:scale-105 transition-all text-center"
            >
              Inquire Corporate Booking &rarr;
            </Link>
            <Link
              href="/turfs"
              className="px-7 py-4 rounded-full bg-transparent text-[#F9B318] border-2 border-[#F9B318] text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(249,179,24,0.2)] hover:bg-[#F9B318]/10 hover:scale-105 transition-all text-center"
            >
              Explore Venues
            </Link>
          </div>
        </div>

        {/* 3D Trophy Showcase */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-[#5245F8]/10 border-4 border-[#5245F8]/30 flex items-center justify-center p-6 shadow-[0_0_60px_rgba(82,69,248,0.25)]">
          <div className="relative w-full h-full animate-float-tilt">
            <Image
              src="/icons/3d-trophy.jpg"
              alt="3D Trophy"
              fill
              className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
