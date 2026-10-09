'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import HeroSection from '@/components/ui/HeroSection';
import InteractiveSportsFilter from '@/components/ui/InteractiveSportsFilter';
import LiveTurfShowcase from '@/components/ui/LiveTurfShowcase';
import FeaturesBento from '@/components/ui/FeaturesBento';
import CorporateEventsCard from '@/components/ui/CorporateEventsCard';

export default function HomePage() {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const localities = [
    'Bandra West',
    'Andheri East',
    'Powai',
    'Juhu',
    'Borivali West',
    'Chembur',
    'Lower Parel',
    'Goregaon',
  ];

  return (
    <main className="min-h-screen bg-[#050507] text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-xl sticky top-0 z-50 bg-[#050507]/80">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-black text-lg shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              GT
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                GoTurf
              </span>
              <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Mumbai
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-sm">
          <Link
            href="/turfs"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors hidden sm:inline-block"
          >
            Find Turfs &rarr;
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 hover:border-amber-500/40 hover:text-white transition-all"
            title="Private parties, corporate sports days & whole-venue bookings"
          >
            <span className="text-[11px]">🏆</span>
            <span>Corporate Events</span>
          </Link>
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-all shadow-md hover:scale-105"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section with GSAP entrance and floating 3D icons */}
      <HeroSection />

      {/* 3D Interactive Sport Selector */}
      <section className="max-w-6xl mx-auto px-6 py-8 w-full">
        <InteractiveSportsFilter
          selectedSport={selectedSport}
          onSelectSport={setSelectedSport}
        />
      </section>

      {/* Live Featured Turfs Showcase (filtered dynamically) */}
      <LiveTurfShowcase selectedSport={selectedSport} />

      {/* Technology & Architectural Features Bento Grid */}
      <FeaturesBento />

      {/* 3D Trophy Corporate Tournaments Banner */}
      <CorporateEventsCard />

      {/* Localities in Mumbai */}
      <section className="max-w-4xl mx-auto px-6 py-12 text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-3">
          Explore Mumbai By Locality
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          {localities.map((loc) => (
            <Link
              key={loc}
              href="/turfs"
              className="px-3.5 py-1.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300 hover:text-emerald-300 hover:border-emerald-500/40 hover:bg-neutral-900 transition-all"
            >
              📍 {loc}
            </Link>
          ))}
        </div>
      </section>

      {/* Footer Status & RBI/Razorpay Compliance Links */}
      <footer className="border-t border-neutral-800/80 px-6 py-10 text-center text-xs text-neutral-500 space-y-4 bg-[#050507]">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-neutral-400">
          <Link href="/terms" className="hover:text-emerald-400 transition-colors">
            Terms of Service
          </Link>
          <span>&bull;</span>
          <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
            Privacy Policy
          </Link>
          <span>&bull;</span>
          <Link href="/refund-policy" className="hover:text-emerald-400 transition-colors">
            Cancellation & Refund Policy
          </Link>
          <span>&bull;</span>
          <Link href="/contact" className="hover:text-emerald-400 transition-colors">
            Contact Us
          </Link>
        </div>
        <p>
          GoTurf Platform &copy; 2026. Live in Mumbai &bull; Carter Road, Bandra West &bull; support@goturf.in
        </p>
      </footer>
    </main>
  );
}
