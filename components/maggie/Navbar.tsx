'use client';

import React from 'react';
import Link from 'next/link';

export default function MaggieNavbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#030303]/90 backdrop-blur-xl border-b border-[#5245F8]/30 px-6 py-3.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-full bg-[#5245F8] text-white flex items-center justify-center font-black text-sm shadow-[0_0_15px_rgba(82,69,248,0.4)] group-hover:rotate-6 transition-transform">
            GT
          </div>
          <span className="font-black text-xl tracking-tight text-white lowercase">
            goturf
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider bg-[#F9B318]/15 text-[#F9B318] px-2 py-0.5 rounded-full border border-[#F9B318]/40 shadow-sm shadow-[#F9B318]/20">
            mumbai
          </span>
        </Link>

        {/* Center / Right Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-black tracking-wider uppercase text-neutral-300">
          <Link href="/turfs" className="hover:text-[#F9B318] transition-colors">
            Venues
          </Link>
          <Link href="/owner" className="hover:text-[#F9B318] transition-colors">
            Add Venue
          </Link>
          <Link href="/contact" className="hover:text-[#F9B318] transition-colors">
            Contact
          </Link>
          <Link href="/terms" className="hover:text-[#F9B318] transition-colors">
            Faqs
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-block text-xs font-black uppercase text-neutral-300 px-3 py-1.5 hover:text-[#F9B318] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/turfs"
            className="px-5 py-2.5 rounded-full bg-[#5245F8] text-white text-xs font-black tracking-wider uppercase shadow-[0_0_20px_rgba(82,69,248,0.35)] hover:bg-[#4335e6] hover:scale-105 transition-all"
          >
            Book a Turf
          </Link>
        </div>
      </div>
    </header>
  );
}
