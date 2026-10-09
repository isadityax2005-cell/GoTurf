'use client';

import React from 'react';
import GlassIcon from './GlassIcon';

export interface SportCategory {
  id: string;
  name: string;
  iconSrc: string;
  count: string;
  description: string;
  highlight: string;
  glowColor: 'emerald' | 'amber' | 'cyan' | 'purple';
}

export const sportsList: SportCategory[] = [
  {
    id: 'cricket',
    name: 'Box Cricket',
    iconSrc: '/icons/3d-cricket.jpg',
    count: '18 Venues',
    description: 'Nets, floodlit pitches & hard bounce turfs',
    highlight: 'Most Popular',
    glowColor: 'emerald',
  },
  {
    id: 'football',
    name: 'Football Arenas',
    iconSrc: '/icons/3d-football.jpg',
    count: '14 Venues',
    description: '5-a-side, 7-a-side & FIFA-standard turf',
    highlight: 'Fast Slots',
    glowColor: 'cyan',
  },
  {
    id: 'pickleball',
    name: 'Pickleball Courts',
    iconSrc: '/icons/3d-pickleball.jpg',
    count: '8 Courts',
    description: 'Indoor AC, cushioned floors & neon lights',
    highlight: 'Trending #1',
    glowColor: 'amber',
  },
  {
    id: 'tennis',
    name: 'Tennis Courts',
    iconSrc: '/icons/3d-tennis.jpg',
    count: '6 Courts',
    description: 'Clay, synthetic & cushioned hard courts',
    highlight: 'Pro Grade',
    glowColor: 'purple',
  },
];

interface Props {
  selectedSport: string | null;
  onSelectSport: (sportId: string | null) => void;
}

export default function InteractiveSportsFilter({
  selectedSport,
  onSelectSport,
}: Props) {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
            Explore By Sport
          </h3>
          <p className="text-xs text-neutral-400">
            Pick a sport to view verified turfs with live slot precision
          </p>
        </div>
        {selectedSport && (
          <button
            onClick={() => onSelectSport(null)}
            className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full"
          >
            Show All Sports &times;
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sportsList.map((sport) => {
          const isSelected = selectedSport === sport.id;

          return (
            <button
              key={sport.id}
              onClick={() => onSelectSport(isSelected ? null : sport.id)}
              className={`group relative text-left p-4 rounded-3xl transition-all duration-300 border flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'bg-neutral-900/90 border-emerald-400/80 shadow-[0_0_30px_rgba(16,185,129,0.25)] scale-[1.02]'
                  : 'bg-neutral-900/40 border-white/10 hover:border-white/20 hover:bg-neutral-900/60'
              }`}
            >
              {/* Highlight Pill */}
              <div className="flex items-center justify-between w-full mb-3">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-neutral-800/60 text-neutral-400 border-white/5'
                  }`}
                >
                  {sport.highlight}
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  {sport.count}
                </span>
              </div>

              {/* 3D Icon & Title */}
              <div className="flex items-center gap-3.5 my-1">
                <GlassIcon
                  src={sport.iconSrc}
                  alt={sport.name}
                  size="md"
                  glowColor={sport.glowColor}
                  floating={isSelected}
                />
                <div>
                  <h4 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
                    {sport.name}
                  </h4>
                  <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                    {sport.description}
                  </p>
                </div>
              </div>

              {/* Bottom active accent line */}
              <div
                className={`mt-3 h-1 w-full rounded-full transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                    : 'bg-neutral-800 group-hover:bg-neutral-700'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
