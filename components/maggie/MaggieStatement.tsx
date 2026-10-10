'use client';

import React from 'react';
import Image from 'next/image';

interface Props {
  selectedSport: string | null;
  onSelectSport: (sportId: string | null) => void;
}

export const sportsCategories = [
  {
    id: 'cricket',
    name: 'Box Cricket',
    iconSrc: '/icons/3d-cricket.jpg',
    badge: 'Most Popular',
    count: '18 Venues',
    desc: 'Floodlit artificial turf pitches & batting nets',
    bgPill: 'rgba(249, 179, 24, 0.15)',
    pillColor: '#F9B318',
  },
  {
    id: 'football',
    name: 'Football Arenas',
    iconSrc: '/icons/3d-football.jpg',
    badge: 'Fast Slots',
    count: '14 Venues',
    desc: '5-a-side & 7-a-side FIFA grade astroturf',
    bgPill: 'rgba(82, 69, 248, 0.15)',
    pillColor: '#5245F8',
  },
  {
    id: 'pickleball',
    name: 'Pickleball Courts',
    iconSrc: '/icons/3d-pickleball.jpg',
    badge: 'Trending #1',
    count: '8 Courts',
    desc: 'Indoor AC courts with neon stadium lines',
    bgPill: 'rgba(249, 179, 24, 0.15)',
    pillColor: '#F9B318',
  },
  {
    id: 'tennis',
    name: 'Tennis Courts',
    iconSrc: '/icons/3d-tennis.jpg',
    badge: 'Pro Grade',
    count: '6 Courts',
    desc: 'Clay, synthetic & cushioned hard courts',
    bgPill: 'rgba(82, 69, 248, 0.15)',
    pillColor: '#5245F8',
  },
];

export default function MaggieStatement({ selectedSport, onSelectSport }: Props) {
  return (
    <section className="relative rounded-t-[50px] sm:rounded-t-[80px] bg-[#07070c] text-white border-t border-[#5245F8]/30 px-6 py-16 sm:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Giant Statement Headline */}
        <div className="relative max-w-4xl">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-[1.08]">
            Find Available Slots Faster Than Your Squad Can Agree on a Match Time
          </h2>

          {/* Handwritten "You're welcome!" note with doodle */}
          <div className="inline-block mt-3 sm:absolute sm:-bottom-7 sm:right-6 text-xl sm:text-2xl font-handwriting text-[#F9B318] -rotate-3 select-none">
            You&apos;re welcome! ✨
          </div>
        </div>

        {/* Section Pill */}
        <div className="mt-12 mb-8 inline-flex items-center gap-2 bg-[#0c0c14] px-5 py-2 rounded-full border border-[#5245F8]/40 shadow-[0_0_15px_rgba(82,69,248,0.2)] text-xs font-black uppercase tracking-widest text-neutral-300">
          <span>WITH GOTURF YOU CAN:</span>
          <span className="text-[#F9B318]">Pick your sport below</span>
        </div>

        {/* 3D Sports Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
          {sportsCategories.map((sport) => {
            const isSelected = selectedSport === sport.id;

            return (
              <button
                key={sport.id}
                onClick={() => onSelectSport(isSelected ? null : sport.id)}
                className={`relative rounded-3xl p-5 border transition-all flex flex-col justify-between text-left cursor-pointer ${
                  isSelected
                    ? 'bg-[#5245F8] text-white border-[#5245F8] shadow-[0_0_30px_rgba(82,69,248,0.5)] translate-x-1 translate-y-1'
                    : 'bg-[#0c0c14] text-white border-[#5245F8]/30 hover:border-[#5245F8]/70 shadow-xl hover:shadow-[0_0_25px_rgba(82,69,248,0.25)] hover:translate-x-1 hover:translate-y-1'
                }`}
              >
                <div>
                  {/* Top Badge & Count */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      style={{ backgroundColor: sport.bgPill, color: isSelected ? '#ffffff' : sport.pillColor }}
                      className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-current shadow-sm"
                    >
                      {sport.badge}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-white' : 'text-[#F9B318]'
                      }`}
                    >
                      {sport.count}
                    </span>
                  </div>

                  {/* 3D Icon Render */}
                  <div className="relative w-24 h-24 mx-auto my-3 rounded-2xl overflow-hidden border border-[#5245F8]/40 shadow-[0_0_20px_rgba(82,69,248,0.2)] bg-[#030303]">
                    <Image
                      src={sport.iconSrc}
                      alt={sport.name}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  {/* Title & Desc */}
                  <h3
                    className="text-lg font-black tracking-tight text-white"
                  >
                    {sport.name}
                  </h3>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isSelected ? 'text-white/90' : 'text-neutral-400'
                    }`}
                  >
                    {sport.desc}
                  </p>
                </div>

                {/* Bottom Filter indicator */}
                <div
                  className={`mt-4 pt-3 border-t text-[11px] font-black uppercase flex items-center justify-between ${
                    isSelected
                      ? 'border-white/20 text-white'
                      : 'border-[#5245F8]/20 text-[#F9B318]'
                  }`}
                >
                  <span>{isSelected ? '✓ Showing Venues' : 'View Venues'}</span>
                  <span>&rarr;</span>
                </div>
              </button>
            );
          })}
        </div>

        {selectedSport && (
          <button
            onClick={() => onSelectSport(null)}
            className="mt-6 text-xs font-black uppercase text-[#F9B318] bg-[#0c0c14] border border-[#F9B318]/50 px-4 py-1.5 rounded-full shadow-lg hover:bg-[#F9B318]/10 transition-all cursor-pointer"
          >
            Show All Sports &times;
          </button>
        )}
      </div>
    </section>
  );
}
