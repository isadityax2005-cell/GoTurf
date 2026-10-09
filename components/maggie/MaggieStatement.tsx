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
    bgPill: '#fdc068',
  },
  {
    id: 'football',
    name: 'Football Arenas',
    iconSrc: '/icons/3d-football.jpg',
    badge: 'Fast Slots',
    count: '14 Venues',
    desc: '5-a-side & 7-a-side FIFA grade astroturf',
    bgPill: '#aefbff',
  },
  {
    id: 'pickleball',
    name: 'Pickleball Courts',
    iconSrc: '/icons/3d-pickleball.jpg',
    badge: 'Trending #1',
    count: '8 Courts',
    desc: 'Indoor AC courts with neon stadium lines',
    bgPill: '#82eda6',
  },
  {
    id: 'tennis',
    name: 'Tennis Courts',
    iconSrc: '/icons/3d-tennis.jpg',
    badge: 'Pro Grade',
    count: '6 Courts',
    desc: 'Clay, synthetic & cushioned hard courts',
    bgPill: '#f6bbfd',
  },
];

export default function MaggieStatement({ selectedSport, onSelectSport }: Props) {
  return (
    <section className="relative rounded-t-[50px] sm:rounded-t-[80px] bg-[#ffff94] text-[#03594d] border-t-2 border-[#03594d] px-6 py-16 sm:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Giant Statement Headline */}
        <div className="relative max-w-4xl">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-[#03594d] leading-[1.08]">
            Find Available Slots Faster Than Your Squad Can Agree on a Match Time
          </h2>

          {/* Handwritten "You're welcome!" note with doodle */}
          <div className="inline-block mt-3 sm:absolute sm:-bottom-7 sm:right-6 text-xl sm:text-2xl font-handwriting text-[#03594d] -rotate-3 select-none">
            You&apos;re welcome! ✨
          </div>
        </div>

        {/* Section Pill */}
        <div className="mt-12 mb-8 inline-flex items-center gap-2 bg-white px-5 py-2 rounded-full border-2 border-[#03594d] shadow-maggie-sm text-xs font-black uppercase tracking-widest">
          <span>WITH GOTURF YOU CAN:</span>
          <span className="text-[#03594d]/60">Pick your sport below</span>
        </div>

        {/* 3D Sports Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
          {sportsCategories.map((sport) => {
            const isSelected = selectedSport === sport.id;

            return (
              <button
                key={sport.id}
                onClick={() => onSelectSport(isSelected ? null : sport.id)}
                className={`relative rounded-3xl p-5 border-2 border-[#03594d] transition-all flex flex-col justify-between text-left ${
                  isSelected
                    ? 'bg-[#03594d] text-[#82eda6] shadow-maggie-sm translate-x-1 translate-y-1'
                    : 'bg-white text-[#03594d] shadow-maggie-lg hover:shadow-maggie hover:translate-x-1 hover:translate-y-1'
                }`}
              >
                <div>
                  {/* Top Badge & Count */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      style={{ backgroundColor: sport.bgPill }}
                      className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#03594d] text-[#03594d] shadow-maggie-sm"
                    >
                      {sport.badge}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-[#82eda6]' : 'text-[#03594d]'
                      }`}
                    >
                      {sport.count}
                    </span>
                  </div>

                  {/* 3D Icon Render */}
                  <div className="relative w-24 h-24 mx-auto my-3 rounded-2xl overflow-hidden border-2 border-[#03594d] shadow-maggie bg-black/5">
                    <Image
                      src={sport.iconSrc}
                      alt={sport.name}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  {/* Title & Desc */}
                  <h3
                    className={`text-lg font-black tracking-tight ${
                      isSelected ? 'text-white' : 'text-[#03594d]'
                    }`}
                  >
                    {sport.name}
                  </h3>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isSelected ? 'text-[#82eda6]/90' : 'text-[#03594d]/80'
                    }`}
                  >
                    {sport.desc}
                  </p>
                </div>

                {/* Bottom Filter indicator */}
                <div
                  className={`mt-4 pt-3 border-t text-[11px] font-black uppercase flex items-center justify-between ${
                    isSelected
                      ? 'border-[#82eda6]/20 text-white'
                      : 'border-[#03594d]/15 text-[#03594d]'
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
            className="mt-6 text-xs font-black uppercase text-[#03594d] bg-white border-2 border-[#03594d] px-4 py-1.5 rounded-full shadow-maggie-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            Show All Sports &times;
          </button>
        )}
      </div>
    </section>
  );
}
