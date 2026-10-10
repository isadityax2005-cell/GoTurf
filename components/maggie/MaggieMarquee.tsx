'use client';

import React from 'react';

interface Props {
  variant?: 'green' | 'yellow';
}

export default function MaggieMarquee({ variant = 'green' }: Props) {
  const items = [
    '🏏 BOX CRICKET',
    '⚽ 5-A-SIDE & 7-A-SIDE',
    '🏓 PICKLEBALL COURTS',
    '🎾 TENNIS ARENAS',
    '📍 BANDRA WEST',
    '📍 ANDHERI EAST',
    '📍 POWAI SMASH',
    '📍 JUHU',
    '⚡ 10-MIN MUTEX HOLD',
    '🎟️ ₹200 ADVANCE TOKEN',
    '🏆 ZERO DOUBLE-BOOKINGS',
    '✨ SMART ALTERNATIVE FINDER',
  ];

  const bgClass =
    variant === 'green'
      ? 'bg-[#07070d] text-[#5245F8] border-y border-[#5245F8]/30 shadow-[0_0_20px_rgba(82,69,248,0.15)]'
      : 'bg-[#090802] text-[#F9B318] border-y border-[#F9B318]/30 shadow-[0_0_20px_rgba(249,179,24,0.15)]';

  return (
    <div className={`overflow-hidden py-3 select-none ${bgClass}`}>
      <div className="animate-marquee flex items-center gap-8 text-xs font-black tracking-widest uppercase">
        {/* Render twice for continuous loop */}
        {[...items, ...items].map((text, i) => (
          <div key={i} className="flex items-center gap-8 whitespace-nowrap">
            <span>{text}</span>
            <span className="opacity-40">&bull;</span>
          </div>
        ))}
      </div>
    </div>
  );
}
