'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';

export default function MaggieHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-sticker', {
        scale: 0.5,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: 'back.out(2)',
      })
        .from(
          '.hero-tag',
          {
            y: -20,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.3'
        )
        .from(
          '.hero-title',
          {
            y: 40,
            opacity: 0,
            duration: 0.7,
          },
          '-=0.4'
        )
        .from(
          '.hero-handwriting',
          {
            scale: 0.8,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.2'
        )
        .from(
          '.hero-btn',
          {
            y: 20,
            opacity: 0,
            stagger: 0.1,
            duration: 0.5,
          },
          '-=0.3'
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative bg-[#82eda6] text-[#03594d] px-6 pt-16 pb-24 sm:pt-24 sm:pb-32 overflow-hidden flex flex-col items-center text-center"
    >
      {/* Floating Maggie-style Stickers on Left & Right */}
      <div className="hero-sticker hidden lg:flex absolute left-8 top-20 items-center gap-2 bg-[#ffff94] text-[#03594d] px-4 py-2 rounded-2xl border-2 border-[#03594d] shadow-maggie font-black text-xs -rotate-6 animate-float-tilt select-none">
        <span>🏏</span>
        <span>box cricket tonight?</span>
      </div>

      <div className="hero-sticker hidden lg:flex absolute right-10 top-24 items-center gap-2 bg-[#aefbff] text-[#03594d] px-4 py-2 rounded-2xl border-2 border-[#03594d] shadow-maggie font-black text-xs rotate-6 animate-float-tilt select-none">
        <span>⚽</span>
        <span>5v5 under floodlights</span>
      </div>

      <div className="hero-sticker hidden md:flex absolute left-14 bottom-24 items-center gap-2 bg-[#fccddc] text-[#03594d] px-4 py-2 rounded-2xl border-2 border-[#03594d] shadow-maggie font-black text-xs rotate-3 animate-float-tilt select-none">
        <span>🎟️</span>
        <span>Match PIN: 7492 check-in</span>
      </div>

      <div className="hero-sticker hidden md:flex absolute right-16 bottom-24 items-center gap-2 bg-[#f6bbfd] text-[#03594d] px-4 py-2 rounded-2xl border-2 border-[#03594d] shadow-maggie font-black text-xs -rotate-3 animate-float-tilt select-none">
        <span>⚡</span>
        <span>10-min live mutex hold</span>
      </div>

      <div className="hero-sticker hidden xl:flex absolute right-1/4 top-12 items-center gap-2 bg-[#fdc068] text-[#03594d] px-3.5 py-1.5 rounded-xl border-2 border-[#03594d] shadow-maggie-sm font-bold text-[11px] rotate-2 select-none">
        <span>💰</span>
        <span>₹200 token reservation</span>
      </div>

      {/* Tiny Tag */}
      <div className="hero-tag mb-6 inline-flex items-center gap-2 bg-[#82eda6] px-4 py-1.5 rounded-full border-2 border-[#03594d] shadow-maggie-sm -rotate-1 select-none">
        <span className="w-2 h-2 rounded-full bg-[#03594d] animate-ping" />
        <span className="text-xs font-black uppercase tracking-wider">
          meet goturf
        </span>
      </div>

      {/* Main Massive Headline */}
      <h1 className="hero-title max-w-4xl text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.02] text-[#03594d]">
        Your pocket pass to booking Mumbai turfs, one match at a time.
      </h1>

      {/* Handwritten scribble */}
      <div className="hero-handwriting mt-4 text-[#03594d] font-handwriting text-lg sm:text-2xl -rotate-2 select-none">
        zero double-bookings guaranteed ~
      </div>

      {/* Paragraph Description */}
      <p className="mt-6 text-[#03594d] font-bold text-base sm:text-xl max-w-2xl leading-relaxed opacity-90">
        Live court precision across Bandra, Andheri, Powai & Juhu. Lock your slot for 10 minutes, pay a ₹200 advance token, and settle the rest at the gate!
      </p>

      {/* CTA Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
        <Link
          href="/turfs"
          className="hero-btn px-8 py-4 rounded-full bg-[#03594d] text-[#82eda6] text-sm font-black uppercase tracking-wider shadow-maggie-lg hover:shadow-maggie hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2"
        >
          <span>Explore Mumbai Arenas</span>
          <span>&rarr;</span>
        </Link>
        <Link
          href="/owner"
          className="hero-btn px-8 py-4 rounded-full bg-[#ffff94] text-[#03594d] text-sm font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie-lg hover:shadow-maggie hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center"
        >
          Add Your Venue
        </Link>
      </div>

      {/* Bottom Mini Social Proof Pill */}
      <div className="mt-12 inline-flex items-center gap-3 bg-[#f9f8f4] text-[#03594d] px-5 py-2.5 rounded-full border-2 border-[#03594d] shadow-maggie-sm text-xs font-bold">
        <span>⭐ 4.9/5 from 1,200+ Mumbai match squads</span>
        <span className="hidden sm:inline">&bull;</span>
        <span className="hidden sm:inline">⚡ 40+ Verified Arenas</span>
      </div>
    </section>
  );
}
