'use client';

import React from 'react';
import Link from 'next/link';

export default function MaggieFooter() {
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
    <footer className="bg-[#030303] text-neutral-400 border-t border-[#5245F8]/30 px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Mumbai Localities */}
        <div className="text-center space-y-4">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#F9B318] block">
            PILOT LOCALITIES ACROSS MUMBAI
          </span>
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {localities.map((loc) => (
              <Link
                key={loc}
                href="/turfs"
                className="px-3.5 py-1.5 rounded-full bg-[#0c0c14] border border-[#5245F8]/30 text-xs font-bold text-neutral-300 hover:border-[#F9B318]/60 hover:text-[#F9B318] transition-all"
              >
                📍 {loc}
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-[#5245F8]/20 w-full" />

        {/* Brand & Links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tight text-white lowercase">
                goturf
              </span>
              <span className="text-[10px] font-black uppercase bg-[#F9B318]/15 text-[#F9B318] px-2 py-0.5 rounded-full border border-[#F9B318]/40">
                mumbai
              </span>
            </div>
            <p className="text-xs font-medium text-neutral-400">
              Made for Mumbai players, by players &bull; Live slot precision.
            </p>
          </div>

          {/* Compliance & Legal Policies */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
            <Link href="/terms" className="hover:text-[#F9B318] transition-colors">
              Terms of Service
            </Link>
            <span>&bull;</span>
            <Link href="/privacy" className="hover:text-[#F9B318] transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link href="/refund-policy" className="hover:text-[#F9B318] transition-colors">
              Refund Policy
            </Link>
            <span>&bull;</span>
            <Link href="/contact" className="hover:text-[#F9B318] transition-colors">
              Contact Us
            </Link>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="text-center text-[11px] font-medium text-neutral-500 pt-4">
          &copy; 2026 GoTurf Platform &bull; Carter Road, Bandra West, Mumbai &bull; support@goturf.in
        </div>
      </div>
    </footer>
  );
}
