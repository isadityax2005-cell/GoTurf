'use client';

import React from 'react';
import Link from 'next/link';

export default function MaggieNavbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#82eda6]/90 backdrop-blur-md border-b-2 border-[#03594d] px-6 py-3.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-full bg-[#03594d] text-[#82eda6] flex items-center justify-center font-black text-sm shadow-maggie-sm group-hover:rotate-6 transition-transform">
            GT
          </div>
          <span className="font-black text-xl tracking-tight text-[#03594d] lowercase">
            goturf
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#ffff94] text-[#03594d] px-2 py-0.5 rounded-full border border-[#03594d] shadow-maggie-sm">
            mumbai
          </span>
        </Link>

        {/* Center / Right Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-black tracking-wider uppercase text-[#03594d]">
          <Link href="/turfs" className="hover:opacity-70 transition-opacity">
            Venues
          </Link>
          <Link href="/owner" className="hover:opacity-70 transition-opacity">
            Add Venue
          </Link>
          <Link href="/contact" className="hover:opacity-70 transition-opacity">
            Contact
          </Link>
          <Link href="/terms" className="hover:opacity-70 transition-opacity">
            Faqs
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-block text-xs font-black uppercase text-[#03594d] px-3 py-1.5 hover:opacity-70 transition-opacity"
          >
            Sign In
          </Link>
          <Link
            href="/turfs"
            className="px-4 py-2 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black tracking-wider uppercase shadow-maggie hover:shadow-maggie-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            Book a Turf
          </Link>
        </div>
      </div>
    </header>
  );
}
