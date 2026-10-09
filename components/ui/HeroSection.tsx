'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';
import GlassIcon from './GlassIcon';
import { sportsList } from './InteractiveSportsFilter';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-badge', {
        y: -15,
        opacity: 0,
        duration: 0.6,
      })
        .from(
          '.hero-heading',
          {
            y: 35,
            opacity: 0,
            duration: 0.8,
          },
          '-=0.3'
        )
        .from(
          '.hero-desc',
          {
            y: 20,
            opacity: 0,
            duration: 0.7,
          },
          '-=0.4'
        )
        .from(
          '.hero-cta',
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
          },
          '-=0.3'
        )
        .from(
          '.hero-stats',
          {
            scale: 0.95,
            opacity: 0,
            duration: 0.6,
          },
          '-=0.2'
        )
        .from(
          '.hero-floating-icon',
          {
            scale: 0.6,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'back.out(1.7)',
          },
          '-=0.5'
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative max-w-6xl mx-auto px-6 pt-12 pb-20 sm:pt-20 sm:pb-28 text-center flex flex-col items-center overflow-hidden"
    >
      {/* Background Ambient Radial Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent blur-[120px] rounded-full -z-10" />

      {/* Floating 3D Sports Badges on Left & Right for Desktop */}
      <div className="hidden lg:block absolute left-2 top-28 pointer-events-none hero-floating-icon">
        <GlassIcon
          src="/icons/3d-cricket.jpg"
          alt="Cricket 3D"
          size="lg"
          glowColor="emerald"
          floating
        />
        <span className="block mt-2 text-[10px] font-bold text-neutral-400 bg-neutral-900/80 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
          🏏 Box Cricket
        </span>
      </div>

      <div className="hidden lg:block absolute right-2 top-28 pointer-events-none hero-floating-icon">
        <GlassIcon
          src="/icons/3d-football.jpg"
          alt="Football 3D"
          size="lg"
          glowColor="cyan"
          floating
        />
        <span className="block mt-2 text-[10px] font-bold text-neutral-400 bg-neutral-900/80 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
          ⚽ Football Arenas
        </span>
      </div>

      {/* Live Badge */}
      <div className="hero-badge inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700/80 text-xs text-neutral-200 shadow-xl backdrop-blur-md mb-8">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-emerald-400">Live Mumbai Turfs:</span>
        <span className="text-neutral-300">Cricket &bull; Football &bull; Pickleball &bull; Tennis</span>
      </div>

      {/* Hero Headline */}
      <h1 className="hero-heading text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.08]">
        Book Mumbai Sports Turfs with{' '}
        <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
          Live Slot Precision.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="hero-desc mt-6 text-neutral-300/90 text-base sm:text-xl max-w-2xl leading-relaxed font-normal">
        Real-time court locks, flexible 2H & 3H+ continuous bookings, ₹200 token reservation, and zero double-booking collisions.
      </p>

      {/* Primary CTAs */}
      <div className="hero-cta mt-9 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
        <Link
          href="/turfs"
          className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-black text-sm font-extrabold hover:opacity-95 shadow-[0_0_35px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
        >
          <span>Explore Verified Mumbai Arenas</span>
          <span className="transition-transform group-hover:translate-x-1 font-bold">&rarr;</span>
        </Link>
        <Link
          href="/owner"
          className="px-7 py-4 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800/90 border border-neutral-700/80 text-neutral-200 text-sm font-bold backdrop-blur-md transition-all flex items-center justify-center hover:border-neutral-600"
        >
          List Your Turf Venue
        </Link>
      </div>

      {/* Quick Stats Pill */}
      <div className="hero-stats mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl">
        <div className="p-3 rounded-2xl bg-neutral-900/40 border border-white/5 backdrop-blur-md">
          <div className="text-xl font-black text-white">40+</div>
          <div className="text-[11px] text-neutral-400">Verified Venues</div>
        </div>
        <div className="p-3 rounded-2xl bg-neutral-900/40 border border-white/5 backdrop-blur-md">
          <div className="text-xl font-black text-emerald-400">10 Min</div>
          <div className="text-[11px] text-neutral-400">Temporary Lock Hold</div>
        </div>
        <div className="p-3 rounded-2xl bg-neutral-900/40 border border-white/5 backdrop-blur-md">
          <div className="text-xl font-black text-white">₹200</div>
          <div className="text-[11px] text-neutral-400">Token Advance Booking</div>
        </div>
        <div className="p-3 rounded-2xl bg-neutral-900/40 border border-white/5 backdrop-blur-md">
          <div className="text-xl font-black text-teal-300">4.9 ★</div>
          <div className="text-[11px] text-neutral-400">Player Rating</div>
        </div>
      </div>
    </section>
  );
}
