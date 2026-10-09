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
    <footer className="bg-[#f9f8f4] text-[#03594d] border-t-2 border-[#03594d] px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Mumbai Localities */}
        <div className="text-center space-y-4">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#03594d]/70 block">
            PILOT LOCALITIES ACROSS MUMBAI
          </span>
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {localities.map((loc) => (
              <Link
                key={loc}
                href="/turfs"
                className="px-3.5 py-1.5 rounded-full bg-white border border-[#03594d] text-xs font-black text-[#03594d] shadow-maggie-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                📍 {loc}
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-[2px] bg-[#03594d]/15 w-full" />

        {/* Brand & Links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tight text-[#03594d] lowercase">
                goturf
              </span>
              <span className="text-[10px] font-black uppercase bg-[#82eda6] text-[#03594d] px-2 py-0.5 rounded-full border border-[#03594d]">
                mumbai
              </span>
            </div>
            <p className="text-xs font-bold text-[#03594d]/70">
              Made for Mumbai players, by players &bull; Live slot precision.
            </p>
          </div>

          {/* Compliance & Legal Policies */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-black uppercase tracking-wider text-[#03594d]">
            <Link href="/terms" className="hover:underline underline-offset-4">
              Terms of Service
            </Link>
            <span>&bull;</span>
            <Link href="/privacy" className="hover:underline underline-offset-4">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link href="/refund-policy" className="hover:underline underline-offset-4">
              Refund Policy
            </Link>
            <span>&bull;</span>
            <Link href="/contact" className="hover:underline underline-offset-4">
              Contact Us
            </Link>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="text-center text-[11px] font-bold text-[#03594d]/60 pt-4">
          &copy; 2026 GoTurf Platform &bull; Carter Road, Bandra West, Mumbai &bull; support@goturf.in
        </div>
      </div>
    </footer>
  );
}
