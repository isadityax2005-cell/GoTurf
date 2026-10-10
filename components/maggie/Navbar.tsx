'use client';

import React from 'react';
import Link from 'next/link';

export default function MaggieNavbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#82eda6]/90 backdrop-blur-md border-b-2 border-[#03594d] px-6 py-3.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-full bg-[#03594d] text-[#82eda6] flex items-center justify-center font-black text-sm shadow-maggie-sm group-hover:rotate-6 transition-transform">
            GT
          </div>
          <span className="font-black text-2xl tracking-tight text-[#03594d] lowercase">
            goturf
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider bg-[#ffff94] text-[#03594d] px-2.5 py-0.5 rounded-full border border-[#03594d] shadow-maggie-sm">
            mumbai
          </span>
        </Link>

        {/* Center / Right Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-black tracking-wider uppercase text-[#03594d]">
          <Link href="/turfs" className="hover:underline underline-offset-4 transition-all">
            Venues
          </Link>
          <Link href="/owner" className="hover:underline underline-offset-4 transition-all">
            Add Venue
          </Link>
          <Link href="/contact" className="hover:underline underline-offset-4 transition-all">
            Contact
          </Link>
          <Link href="/terms" className="hover:underline underline-offset-4 transition-all">
            Faqs
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-block text-xs font-black uppercase text-[#03594d] px-3 py-1.5 hover:underline underline-offset-4 transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/turfs"
            className="px-5 py-2.5 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black tracking-wider uppercase border-2 border-[#03594d] shadow-maggie hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-maggie-lg transition-all"
          >
            Book a Turf
          </Link>
        </div>
      </div>
    </header>
  );
}
