'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import TurfCard from '@/components/turf-card';
import { DEMO_TURFS } from '@/lib/data/turfs';
import type { SportType } from '@/types/database';
import MaggieNavbar from '@/components/maggie/Navbar';
import MaggieFooter from '@/components/maggie/MaggieFooter';

export default function TurfsDiscoveryPage() {
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('all');
  const [selectedLocality, setSelectedLocality] = useState<string>('all');

  const sportsList: { label: string; value: SportType | 'all'; iconSrc?: string; emoji?: string }[] = [
    { label: 'All Sports', value: 'all', emoji: '🏆' },
    { label: 'Cricket', value: 'cricket', iconSrc: '/icons/3d-cricket.jpg' },
    { label: 'Football', value: 'football', iconSrc: '/icons/3d-football.jpg' },
    { label: 'Pickleball', value: 'pickleball', iconSrc: '/icons/3d-pickleball.jpg' },
    { label: 'Tennis', value: 'tennis', iconSrc: '/icons/3d-tennis.jpg' },
  ];

  const localities = [
    { label: 'All Mumbai', value: 'all' },
    { label: 'Bandra West', value: 'Bandra West' },
    { label: 'Powai', value: 'Powai' },
    { label: 'Andheri East', value: 'Andheri East' },
    { label: 'Juhu', value: 'Juhu' },
    { label: 'Borivali West', value: 'Borivali West' },
  ];

  // Strictly filter for approved, non-hidden venues
  const filteredTurfs = useMemo(() => {
    return DEMO_TURFS.filter((turf) => {
      if (turf.status !== 'approved') return false;

      const matchesSport =
        selectedSport === 'all' ||
        turf.courts?.some((c) => c.sport === selectedSport && c.is_active);

      const matchesLocality =
        selectedLocality === 'all' ||
        turf.region?.locality.toLowerCase() === selectedLocality.toLowerCase();

      return matchesSport && matchesLocality;
    });
  }, [selectedSport, selectedLocality]);

  return (
    <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col justify-between selection:bg-[#ffff94] selection:text-[#03594d]">
      {/* Top Navbar */}
      <MaggieNavbar />

      {/* Main Discovery Container */}
      <div className="max-w-6xl w-full mx-auto px-6 py-10 flex-1">
        {/* Page Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-[#ffff94] text-[#03594d] px-3.5 py-1 rounded-full border-2 border-[#03594d] shadow-maggie-sm text-xs font-black uppercase tracking-wider mb-3 select-none">
            <span>⚡ LIVE MUMBAI VENUES</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#03594d] tracking-tight uppercase leading-[1.05]">
            Find & Book Sports Turfs in Mumbai
          </h1>
          <p className="text-sm font-bold text-[#03594d]/80 mt-2 max-w-xl">
            Live slot availability, verified venues, and instant online checkout for Cricket, Football, Tennis, and Pickleball.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-4 mb-10">
          {/* Sports Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {sportsList.map((sport) => (
              <button
                key={sport.value}
                onClick={() => setSelectedSport(sport.value)}
                className={`px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 border-2 border-[#03594d] ${
                  selectedSport === sport.value
                    ? 'bg-[#03594d] text-[#82eda6] shadow-maggie-sm translate-x-0.5 translate-y-0.5'
                    : 'bg-white text-[#03594d] shadow-maggie hover:shadow-maggie-sm hover:translate-x-0.5 hover:translate-y-0.5'
                }`}
              >
                {sport.iconSrc ? (
                  <div className="relative w-5 h-5 rounded-md overflow-hidden shrink-0 border border-[#03594d]">
                    <Image
                      src={sport.iconSrc}
                      alt={sport.label}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <span>{sport.emoji}</span>
                )}
                <span>{sport.label}</span>
              </button>
            ))}
          </div>

          {/* Localities Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {localities.map((loc) => (
              <button
                key={loc.value}
                onClick={() => setSelectedLocality(loc.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all border ${
                  selectedLocality === loc.value
                    ? 'bg-[#03594d] text-[#82eda6] border-[#03594d]'
                    : 'bg-white/80 border-[#03594d]/30 text-[#03594d] hover:bg-white'
                }`}
              >
                📍 {loc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Venues Grid */}
        {filteredTurfs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTurfs.map((turf) => (
              <TurfCard key={turf.id} turf={turf} />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-white border-2 border-[#03594d] shadow-maggie-lg text-center max-w-md mx-auto">
            <span className="text-4xl block mb-3">🔍</span>
            <h3 className="text-lg font-black text-[#03594d] mb-1">No Turfs Found</h3>
            <p className="text-xs font-bold text-[#03594d]/70 mb-4">
              We couldn&apos;t find any verified venues matching your current sport and locality filters.
            </p>
            <button
              onClick={() => {
                setSelectedSport('all');
                setSelectedLocality('all');
              }}
              className="px-5 py-2.5 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider shadow-maggie-sm"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Maggie Footer */}
      <MaggieFooter />
    </main>
  );
}
