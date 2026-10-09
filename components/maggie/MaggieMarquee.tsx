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
      ? 'bg-[#03594d] text-[#82eda6] border-y-2 border-[#03594d]'
      : 'bg-[#ffff94] text-[#03594d] border-y-2 border-[#03594d]';

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
