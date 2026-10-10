'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';
import CrystalizedBall from '@/components/ui/CrystalizedBall';

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
      className="relative bg-[#030303] text-white px-6 pt-16 pb-24 sm:pt-24 sm:pb-32 overflow-hidden flex flex-col items-center text-center"
    >
      {/* CrystalizedBall Canvas Interactive Hero Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-85">
        <CrystalizedBall
          preset="nebula"
          color="#5245F8"
          size={1.15}
          glow={1.2}
          sparks={0.8}
          flares={0.7}
          interactive={true}
          hoverStrength={0.85}
          speed={0.85}
        />
      </div>

      {/* Ambient Gradient Glows */}
      <div className="pointer-events-none absolute -left-20 top-1/4 w-96 h-96 bg-[#5245F8]/15 rounded-full blur-[120px] z-0" />
      <div className="pointer-events-none absolute -right-20 top-1/3 w-96 h-96 bg-[#F9B318]/10 rounded-full blur-[120px] z-0" />

      {/* Floating Stickers on Left & Right */}
      <div className="hero-sticker hidden lg:flex absolute left-8 top-20 items-center gap-2 bg-[#0c0c14]/90 text-white px-4 py-2 rounded-2xl border-2 border-[#5245F8]/50 shadow-[0_0_20px_rgba(82,69,248,0.3)] font-black text-xs -rotate-6 animate-float-tilt select-none z-10 backdrop-blur-md">
        <span>🏏</span>
        <span>box cricket tonight?</span>
      </div>

      <div className="hero-sticker hidden lg:flex absolute right-10 top-24 items-center gap-2 bg-[#0c0c14]/90 text-[#F9B318] px-4 py-2 rounded-2xl border-2 border-[#F9B318]/50 shadow-[0_0_20px_rgba(249,179,24,0.3)] font-black text-xs rotate-6 animate-float-tilt select-none z-10 backdrop-blur-md">
        <span>⚽</span>
        <span>5v5 under floodlights</span>
      </div>

      <div className="hero-sticker hidden md:flex absolute left-14 bottom-24 items-center gap-2 bg-[#0c0c14]/90 text-white px-4 py-2 rounded-2xl border-2 border-[#5245F8]/50 shadow-[0_0_20px_rgba(82,69,248,0.3)] font-black text-xs rotate-3 animate-float-tilt select-none z-10 backdrop-blur-md">
        <span>🎟️</span>
        <span>Match PIN: 7492 check-in</span>
      </div>

      <div className="hero-sticker hidden md:flex absolute right-16 bottom-24 items-center gap-2 bg-[#0c0c14]/90 text-[#F9B318] px-4 py-2 rounded-2xl border-2 border-[#F9B318]/50 shadow-[0_0_20px_rgba(249,179,24,0.3)] font-black text-xs -rotate-3 animate-float-tilt select-none z-10 backdrop-blur-md">
        <span>⚡</span>
        <span>10-min live mutex hold</span>
      </div>

      <div className="hero-sticker hidden xl:flex absolute right-1/4 top-12 items-center gap-2 bg-[#5245F8]/20 text-[#F9B318] px-3.5 py-1.5 rounded-xl border border-[#F9B318]/50 shadow-[0_0_15px_rgba(249,179,24,0.25)] font-bold text-[11px] rotate-2 select-none z-10 backdrop-blur-md">
        <span>💰</span>
        <span>₹200 token reservation</span>
      </div>

      {/* Tiny Tag */}
      <div className="hero-tag mb-6 inline-flex items-center gap-2 bg-[#5245F8]/20 text-[#F9B318] px-4 py-1.5 rounded-full border border-[#5245F8]/50 shadow-sm shadow-[#5245F8]/30 -rotate-1 select-none z-10 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-[#F9B318] animate-ping" />
        <span className="text-xs font-black uppercase tracking-wider">
          meet goturf
        </span>
      </div>

      {/* Main Massive Headline */}
      <h1 className="hero-title max-w-4xl text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.02] text-white z-10">
        Your pocket pass to booking <span className="text-[#F9B318]">Mumbai turfs</span>, one match at a time.
      </h1>

      {/* Handwritten scribble */}
      <div className="hero-handwriting mt-4 text-[#F9B318] font-handwriting text-lg sm:text-2xl -rotate-2 select-none z-10">
        zero double-bookings guaranteed ~
      </div>

      {/* Paragraph Description */}
      <p className="mt-6 text-neutral-300 font-medium text-base sm:text-xl max-w-2xl leading-relaxed z-10">
        Live court precision across Bandra, Andheri, Powai & Juhu. Lock your slot for 10 minutes, pay a ₹200 advance token, and settle the rest at the gate!
      </p>

      {/* CTA Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center z-10">
        <Link
          href="/turfs"
          className="hero-btn px-8 py-4 rounded-full bg-[#5245F8] text-white text-sm font-black uppercase tracking-wider shadow-[0_0_30px_rgba(82,69,248,0.4)] hover:bg-[#4335e6] hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
          <span>Explore Mumbai Arenas</span>
          <span>&rarr;</span>
        </Link>
        <Link
          href="/owner"
          className="hero-btn px-8 py-4 rounded-full bg-transparent text-[#F9B318] text-sm font-black uppercase tracking-wider border-2 border-[#F9B318] shadow-[0_0_20px_rgba(249,179,24,0.2)] hover:bg-[#F9B318]/10 hover:scale-105 transition-all flex items-center justify-center"
        >
          Add Your Venue
        </Link>
      </div>

      {/* Bottom Mini Social Proof Pill */}
      <div className="mt-12 inline-flex items-center gap-3 bg-[#0c0c14]/90 text-neutral-300 px-5 py-2.5 rounded-full border border-[#5245F8]/30 shadow-lg text-xs font-bold z-10 backdrop-blur-md">
        <span className="text-[#F9B318]">⭐ 4.9/5 from 1,200+ Mumbai match squads</span>
        <span className="hidden sm:inline">&bull;</span>
        <span className="hidden sm:inline text-white">⚡ 40+ Verified Arenas</span>
      </div>
    </section>
  );
}
