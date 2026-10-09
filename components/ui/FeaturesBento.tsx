'use client';

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import SpotlightCard from './SpotlightCard';
import GlassIcon from './GlassIcon';

export default function FeaturesBento() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.bento-item', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        },
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Engineered for Mumbai Turf Players
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
          Why Players & Venue Owners Rely on GoTurf
        </h2>
        <p className="text-neutral-400 text-sm mt-2">
          Say goodbye to manual WhatsApp calls, lost reservation tokens, and double-booking arguments at the gate.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Concurrency Mutex */}
        <SpotlightCard className="bento-item p-7 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Live Mutex Locking
              </span>
              <span className="text-xs text-neutral-400">10-Minute Hold</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Zero Double-Bookings with 10-Minute Temporary Holds
            </h3>
            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              The moment you tap checkout, the slot is locked across all devices for 10 minutes. No other player can jump in or steal your match slot while you enter payment details.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700/80 text-emerald-300 font-medium">
              ✓ Instant Server-Side Mutex
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700/80 text-neutral-300">
              ✓ Automated Expiry Release
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700/80 text-neutral-300">
              ✓ Synchronized Real-time UI
            </span>
          </div>
        </SpotlightCard>

        {/* Card 2: 3D Pickleball / Multi-Hour Continuous */}
        <SpotlightCard className="bento-item p-7 flex flex-col justify-between" spotlightColor="rgba(245, 158, 11, 0.15)">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Continuous Sessions
              </span>
              <GlassIcon
                src="/icons/3d-pickleball.jpg"
                alt="Pickleball"
                size="sm"
                glowColor="amber"
              />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Multi-Hour (2H & 3H+) Continuous Bookings
            </h3>
            <p className="text-neutral-300 text-xs leading-relaxed">
              Plan full-length tournament friendlies and multi-hour practice blocks without booking individual disconnected 1-hour slots.
            </p>
          </div>

          <div className="mt-4 text-xs text-amber-300 font-semibold flex items-center gap-1.5">
            <span>✨ Smart Alternative Slot Finder active</span>
          </div>
        </SpotlightCard>

        {/* Card 3: ₹200 Token Advance & Gate PIN */}
        <SpotlightCard className="bento-item p-7 flex flex-col justify-between" spotlightColor="rgba(6, 182, 212, 0.15)">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                Phase 7+ Hybrid Cash/UPI
              </span>
              <GlassIcon
                src="/icons/3d-football.jpg"
                alt="Football"
                size="sm"
                glowColor="cyan"
              />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              ₹200 Token Advance & Match PIN
            </h3>
            <p className="text-neutral-300 text-xs leading-relaxed">
              Pay a minimal ₹200 reservation token online, and settle the remaining turf amount in cash or ground UPI right at the venue gate.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="font-mono text-xs bg-black/60 border border-neutral-700 px-2.5 py-1 rounded-lg text-cyan-300 font-bold">
              PIN: 7492
            </span>
            <span className="text-[11px] text-neutral-400">Instant Check-in Pass</span>
          </div>
        </SpotlightCard>

        {/* Card 4: Automated Refund & Collision Protection */}
        <SpotlightCard className="bento-item p-7 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Bank-Grade Reliability
              </span>
              <span className="text-xs text-neutral-400">RBI & Razorpay Compliant</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Automated Reversal on Concurrency Collision
            </h3>
            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              In the ultra-rare event two players attempt payment for the same slot in the exact same millisecond, our automated backend detects the race and issues an instantaneous automatic refund directly to your original source account.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700/80 text-emerald-300 font-medium">
              ✓ Automated Webhook Triggers
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700/80 text-neutral-300">
              ✓ Direct Source Bank Refund
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700/80 text-neutral-300">
              ✓ SMS & WhatsApp Match Pass
            </span>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}
