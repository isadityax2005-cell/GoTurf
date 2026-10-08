'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import TurfCard from '@/components/turf-card';
import { DEMO_TURFS } from '@/lib/data/turfs';
import type { SportType } from '@/types/database';

export default function TurfsDiscoveryPage() {
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('all');
  const [selectedLocality, setSelectedLocality] = useState<string>('all');

  const sportsList: { label: string; value: SportType | 'all'; icon: string }[] = [
    { label: 'All Sports', value: 'all', icon: '🏆' },
    { label: 'Cricket', value: 'cricket', icon: '🏏' },
    { label: 'Football', value: 'football', icon: '⚽' },
    { label: 'Tennis', value: 'tennis', icon: '🎾' },
    { label: 'Pickleball', value: 'pickleball', icon: '🏓' },
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
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-neutral-950/80">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-black text-sm">
              GT
            </div>
            <span className="font-bold text-lg tracking-tight text-white">GoTurf</span>
          </Link>
          <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Mumbai
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/owner"
            className="hidden sm:inline-block text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-800"
          >
            For Turf Owners
          </Link>
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Discovery Container */}
      <div className="max-w-6xl w-full mx-auto px-6 py-10 flex-1">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Find & Book Sports Turfs in <span className="text-emerald-400">Mumbai</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-2 max-w-xl">
            Live slot availability, verified venues, and instant online checkout for Cricket, Football, Tennis, and Pickleball.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-4 mb-10">
          {/* Sports Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {sportsList.map((sport) => (
              <button
                key={sport.value}
                onClick={() => setSelectedSport(sport.value)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedSport === sport.value
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <span>{sport.icon}</span>
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedLocality === loc.value
                    ? 'bg-neutral-800 text-white border border-neutral-700'
                    : 'bg-neutral-950 border border-neutral-900 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {loc.label}
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
          <div className="p-12 rounded-3xl bg-neutral-900/40 border border-neutral-800 text-center max-w-md mx-auto">
            <span className="text-4xl block mb-3">🔍</span>
            <h3 className="text-base font-bold text-white mb-1">No Turfs Found</h3>
            <p className="text-xs text-neutral-400 mb-4">
              We couldn&apos;t find any verified venues matching your current sport and locality filters.
            </p>
            <button
              onClick={() => {
                setSelectedSport('all');
                setSelectedLocality('all');
              }}
              className="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-semibold text-white hover:bg-neutral-700"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 px-6 py-6 text-center text-xs text-neutral-500">
        GoTurf &bull; Live Turf Discovery in Mumbai
      </footer>
    </main>
  );
}
