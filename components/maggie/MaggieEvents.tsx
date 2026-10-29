'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';

export default function MaggieEvents() {
  const sectionRef = useRef<HTMLElement>(null);
  const trophyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(trophyRef.current, {
        scale: 0.7,
        rotation: -10,
        opacity: 0,
        duration: 0.9,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative rounded-t-[50px] sm:rounded-t-[80px] bg-[#03594d] text-white border-t-2 border-[#03594d] px-6 py-20 sm:py-28 overflow-hidden select-none"
    >
      {/* Decorative background subtle rings */}
      <div className="pointer-events-none absolute -right-24 top-1/4 w-96 h-96 rounded-full border-2 border-[#82eda6]/20" />
      <div className="pointer-events-none absolute -left-24 bottom-1/4 w-96 h-96 rounded-full border-2 border-[#ffff94]/20" />

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
        <div className="flex-1 text-center md:text-left">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-[#ffff94] text-[#03594d] px-4 py-1.5 rounded-full border-2 border-[#03594d] shadow-maggie-sm text-xs font-black uppercase tracking-wider mb-5">
            <span>🏆 corporate & tournament booking</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-[1.05]">
            Turn Weekend Chaos into{' '}
            <span className="text-[#ffff94] underline decoration-wavy decoration-[#82eda6] underline-offset-8">
              Championships
            </span>{' '}
            with GoTurf!
          </h2>

          <p className="mt-5 text-[#82eda6] font-medium text-sm sm:text-base max-w-xl leading-relaxed">
            Hosting company cups, birthday matches, or multi-court box cricket leagues? Get whole-venue block holds, referee assistance, and custom tournament fixtures across premier Mumbai turfs.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              href="/contact"
              className="px-8 py-4 rounded-full bg-[#ffff94] text-[#03594d] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#f5f583] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-maggie-lg transition-all text-center"
            >
              Inquire Corporate Booking &rarr;
            </Link>
            <Link
              href="/turfs"
              className="px-7 py-4 rounded-full bg-[#82eda6] text-[#03594d] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#6ee395] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-maggie-lg transition-all text-center"
            >
              Explore Venues
            </Link>
          </div>
        </div>

        {/* 3D Trophy Showcase with GSAP animation */}
        <div
          ref={trophyRef}
          className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-[#82eda6]/20 border-4 border-[#82eda6] flex items-center justify-center p-6 shadow-maggie-xl"
        >
          <div className="relative w-full h-full animate-float-tilt">
            <Image
              src="/icons/3d-trophy.jpg"
              alt="3D Trophy"
              fill
              className="object-contain drop-shadow-[0_15px_30px_rgba(3,89,77,0.5)] rounded-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
