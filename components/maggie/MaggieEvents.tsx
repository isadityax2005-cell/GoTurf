'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function MaggieEvents() {
  return (
    <section className="relative rounded-t-[50px] sm:rounded-t-[80px] bg-[#03594d] text-[#82eda6] border-t-2 border-[#03594d] px-6 py-20 sm:py-28 overflow-hidden">
      {/* Decorative background shapes */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center md:text-left">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-[#ffff94] text-[#03594d] px-4 py-1 rounded-full border-2 border-[#03594d] shadow-maggie-sm text-xs font-black uppercase tracking-wider mb-4 select-none">
            <span>🏆 corporate & tournament booking</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-[1.05]">
            Turn Weekend Chaos into{' '}
            <span className="text-[#82eda6]">Championships</span> with GoTurf!
          </h2>

          <p className="mt-4 text-[#82eda6]/90 font-bold text-sm sm:text-base max-w-xl leading-relaxed">
            Hosting company cups, birthday matches, or multi-court box cricket leagues? Get whole-venue block holds, referee assistance, and custom tournament fixtures across premier Mumbai turfs.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              href="/contact"
              className="px-8 py-4 rounded-full bg-[#ffff94] text-[#03594d] text-xs font-black uppercase tracking-wider shadow-maggie-lg hover:shadow-maggie hover:translate-x-1 hover:translate-y-1 transition-all text-center"
            >
              Inquire Corporate Booking &rarr;
            </Link>
            <Link
              href="/turfs"
              className="px-7 py-4 rounded-full bg-transparent text-[#82eda6] border-2 border-[#82eda6] text-xs font-black uppercase tracking-wider hover:bg-[#82eda6] hover:text-[#03594d] transition-all text-center"
            >
              Explore Venues
            </Link>
          </div>
        </div>

        {/* 3D Trophy Showcase */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-[#82eda6]/10 border-4 border-[#82eda6]/30 flex items-center justify-center p-6 shadow-2xl">
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
