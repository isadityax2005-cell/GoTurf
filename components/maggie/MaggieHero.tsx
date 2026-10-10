'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export default function MaggieHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Initial Entry Animation
      const tl = gsap.timeline({ defaults: { ease: 'back.out(1.7)' } });

      tl.from('.hero-tag', {
        y: -30,
        opacity: 0,
        duration: 0.6,
      })
        .from(
          '.hero-title',
          {
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.3'
        )
        .from(
          '.hero-handwriting',
          {
            scale: 0.7,
            rotation: -10,
            opacity: 0,
            duration: 0.6,
            ease: 'back.out(2)',
          },
          '-=0.4'
        )
        .from(
          '.hero-desc',
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
          },
          '-=0.3'
        )
        .from(
          '.hero-btn',
          {
            scale: 0.85,
            opacity: 0,
            stagger: 0.1,
            duration: 0.5,
          },
          '-=0.3'
        )
        .from(
          '.hero-sticker',
          {
            scale: 0.3,
            opacity: 0,
            stagger: 0.09,
            duration: 0.7,
            ease: 'back.out(2.2)',
          },
          '-=0.4'
        )
        .from(
          '.hero-proof',
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.2'
        );

      // 2. GSAP ScrollTrigger Parallax for Floating Stickers
      gsap.to('.hero-sticker-left', {
        y: -50,
        rotation: '-=4',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      gsap.to('.hero-sticker-right', {
        y: -70,
        rotation: '+=5',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.4,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative bg-[#82eda6] text-[#03594d] px-6 pt-14 pb-24 sm:pt-20 sm:pb-32 overflow-hidden flex flex-col items-center text-center select-none"
    >
      {/* Decorative Subtle Background Rings */}
      <div className="pointer-events-none absolute -left-24 top-1/4 w-96 h-96 rounded-full border-2 border-[#03594d]/10" />
      <div className="pointer-events-none absolute -right-24 top-1/3 w-96 h-96 rounded-full border-2 border-[#03594d]/10" />

      {/* Floating Maggie Neo-Brutalist Pastel Stickers */}
      <div ref={stickersRef}>
        {/* Sticker 1: Peach / Cricket */}
        <div className="hero-sticker hero-sticker-left hidden lg:flex absolute left-8 top-16 items-center gap-2 bg-[#fdc068] text-[#03594d] px-4 py-2 rounded-2xl border-2 border-[#03594d] shadow-maggie font-black text-xs -rotate-6 animate-float-tilt z-20">
          <span className="text-base">🏏</span>
          <span>box cricket tonight?</span>
        </div>

        {/* Sticker 2: Cyan / Football */}
        <div className="hero-sticker hero-sticker-right hidden lg:flex absolute right-10 top-20 items-center gap-2 bg-[#aefbff] text-[#03594d] px-4 py-2 rounded-2xl border-2 border-[#03594d] shadow-maggie font-black text-xs rotate-6 animate-float-tilt z-20">
          <span className="text-base">⚽</span>
          <span>5v5 under floodlights</span>
        </div>

        {/* Sticker 3: Pink / Match PIN */}
        <div className="hero-sticker hero-sticker-left hidden md:flex absolute left-12 bottom-20 items-center gap-2 bg-[#fccddc] text-[#03594d] px-4 py-2 rounded-2xl border-2 border-[#03594d] shadow-maggie font-black text-xs rotate-3 animate-float-tilt z-20">
          <span className="text-base">🎟️</span>
          <span>Match PIN: 7492 check-in</span>
        </div>

        {/* Sticker 4: Butter Yellow / Mutex Hold */}
        <div className="hero-sticker hero-sticker-right hidden md:flex absolute right-12 bottom-20 items-center gap-2 bg-[#ffff94] text-[#03594d] px-4 py-2 rounded-2xl border-2 border-[#03594d] shadow-maggie font-black text-xs -rotate-3 animate-float-tilt z-20">
          <span className="text-base">⚡</span>
          <span>10-min live mutex hold</span>
        </div>

        {/* Sticker 5: Lavender / Advance Token */}
        <div className="hero-sticker hero-sticker-right hidden xl:flex absolute right-1/4 top-10 items-center gap-2 bg-[#f6bbfd] text-[#03594d] px-3.5 py-1.5 rounded-xl border-2 border-[#03594d] shadow-maggie font-black text-[11px] rotate-2 z-20">
          <span className="text-base">💰</span>
          <span>₹200 token reservation</span>
        </div>
      </div>

      {/* Tiny Tag */}
      <div className="hero-tag mb-6 inline-flex items-center gap-2 bg-[#ffff94] text-[#03594d] px-4 py-1.5 rounded-full border-2 border-[#03594d] shadow-maggie-sm -rotate-1 z-10">
        <span className="w-2.5 h-2.5 rounded-full bg-[#03594d] animate-ping" />
        <span className="text-xs font-black uppercase tracking-wider">
          meet goturf
        </span>
      </div>

      {/* Main Massive Headline */}
      <h1 className="hero-title max-w-4xl text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.02] text-[#03594d] z-10">
        Your pocket pass to booking{' '}
        <span className="underline decoration-wavy decoration-[#ffff94] underline-offset-8">
          Mumbai turfs
        </span>
        , one match at a time.
      </h1>

      {/* Handwritten scribble note */}
      <div className="hero-handwriting mt-5 text-[#03594d] font-handwriting text-xl sm:text-3xl -rotate-2 z-10">
        zero double-bookings guaranteed ~
      </div>

      {/* Paragraph Description */}
      <p className="hero-desc mt-6 text-[#03594d]/85 font-semibold text-base sm:text-xl max-w-2xl leading-relaxed z-10">
        Live court precision across Bandra, Andheri, Powai & Juhu. Lock your slot for 10 minutes, pay a ₹200 advance token, and settle the rest at the gate!
      </p>

      {/* CTA Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center z-10">
        <Link
          href="/turfs"
          className="hero-btn btn-maggie-primary px-8 py-4 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <span>Explore Mumbai Arenas</span>
          <span>&rarr;</span>
        </Link>
        <Link
          href="/owner"
          className="hero-btn btn-maggie-secondary px-8 py-4 text-sm font-black uppercase tracking-wider flex items-center justify-center"
        >
          Add Your Venue
        </Link>
      </div>

      {/* Bottom Mini Social Proof Pill */}
      <div className="hero-proof mt-12 inline-flex items-center gap-3 bg-white/90 text-[#03594d] px-5 py-2.5 rounded-full border-2 border-[#03594d] shadow-maggie-sm text-xs font-bold z-10">
        <span className="text-[#03594d]">⭐ 4.9/5 from 1,200+ Mumbai match squads</span>
        <span className="hidden sm:inline">&bull;</span>
        <span className="hidden sm:inline">⚡ 40+ Verified Arenas</span>
      </div>
    </section>
  );
}
