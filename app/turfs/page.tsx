'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import TurfCard from '@/components/turf-card';
import { DEMO_TURFS } from '@/lib/data/turfs';
import type { SportType } from '@/types/database';
import MaggieNavbar from '@/components/maggie/Navbar';
import MaggieFooter from '@/components/maggie/MaggieFooter';
import CrystalizedBall from '@/components/ui/CrystalizedBall';

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
    <main className="min-h-screen bg-[#030303] text-neutral-100 flex flex-col justify-between selection:bg-[#F9B318] selection:text-black relative overflow-hidden">
      {/* Background Ambient Canvas */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 overflow-hidden">
        <CrystalizedBall
          preset="nebula"
          color="#5245F8"
          size={1.6}
          speed={0.4}
          interactive={false}
          glow={0.8}
          haze={0.9}
        />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Top Navbar */}
        <MaggieNavbar />

        {/* Main Discovery Container */}
        <div className="max-w-6xl w-full mx-auto px-6 py-10 flex-1">
          {/* Page Title */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-[#F9B318]/15 text-[#F9B318] px-3.5 py-1 rounded-full border border-[#F9B318]/40 shadow-sm shadow-[#F9B318]/20 text-xs font-black uppercase tracking-wider mb-3 select-none">
              <span>⚡ LIVE MUMBAI VENUES</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase leading-[1.05]">
              Find & Book Sports Turfs in Mumbai
            </h1>
            <p className="text-sm font-medium text-neutral-400 mt-2 max-w-xl">
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
                  className={`px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
                    selectedSport === sport.value
                      ? 'bg-[#5245F8] text-white border-[#5245F8] shadow-[0_0_20px_rgba(82,69,248,0.4)] translate-x-0.5 translate-y-0.5'
                      : 'bg-[#0c0c14] text-neutral-300 border-[#5245F8]/30 hover:border-[#5245F8]/70 hover:text-white shadow-md'
                  }`}
                >
                  {sport.iconSrc ? (
                    <div className="relative w-5 h-5 rounded-md overflow-hidden shrink-0 border border-[#5245F8]/40">
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                    selectedLocality === loc.value
                      ? 'bg-[#5245F8] text-white border-[#5245F8] shadow-md shadow-[#5245F8]/30'
                      : 'bg-[#0c0c14] border-[#5245F8]/20 text-neutral-400 hover:text-white hover:border-[#5245F8]/50'
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
            <div className="p-12 rounded-3xl bg-[#09090e] border border-[#5245F8]/30 shadow-xl text-center max-w-md mx-auto">
              <span className="text-4xl block mb-3">🔍</span>
              <h3 className="text-lg font-black text-white mb-1">No Turfs Found</h3>
              <p className="text-xs font-medium text-neutral-400 mb-4">
                We couldn&apos;t find any verified venues matching your current sport and locality filters.
              </p>
              <button
                onClick={() => {
                  setSelectedSport('all');
                  setSelectedLocality('all');
                }}
                className="px-5 py-2.5 rounded-full bg-[#5245F8] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#5245F8]/30 hover:bg-[#4335e6] cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Maggie Footer */}
        <MaggieFooter />
      </div>
    </main>
  );
}
