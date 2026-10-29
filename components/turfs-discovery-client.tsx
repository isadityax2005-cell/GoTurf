'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TurfCard from '@/components/turf-card';
import type { SportType, Turf } from '@/types/database';

interface Props {
  initialTurfs: Turf[];
  initialMode?: 'live' | 'demo';
}

export default function TurfsDiscoveryClient({ initialTurfs, initialMode }: Props) {
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('all');
  const [selectedLocality, setSelectedLocality] = useState<string>('all');
  const defaultMode =
    initialMode ||
    (initialTurfs.some((t) => t.is_demo) || process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
      ? 'demo'
      : 'live');
  const [mode, setMode] = useState<'live' | 'demo'>(defaultMode);
  const [turfs, setTurfs] = useState<Turf[]>(initialTurfs);
  const [loading, setLoading] = useState(false);
  const isFirstMount = useRef(true);

  // Refresh or switch turfs when mode changes (skip on first mount to avoid SSR flash)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    async function loadTurfsForMode() {
      setLoading(true);
      try {
        const res = await fetch(`/api/turfs?mode=${mode}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.turfs)) {
          setTurfs(data.turfs);
        }
      } catch (err) {
        console.warn('Turfs refresh failed, using current state:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTurfsForMode();
  }, [mode]);

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
    { label: 'Kurla West', value: 'Kurla West' },
    { label: 'Juhu', value: 'Juhu' },
    { label: 'Borivali West', value: 'Borivali West' },
  ];

  // Strictly filter for approved, non-hidden venues
  const filteredTurfs = useMemo(() => {
    return turfs.filter((turf) => {
      if (turf.status !== 'approved') return false;

      const matchesSport =
        selectedSport === 'all' ||
        turf.courts?.some((c) => c.sport === selectedSport && c.is_active);

      const matchesLocality =
        selectedLocality === 'all' ||
        turf.region?.locality.toLowerCase() === selectedLocality.toLowerCase();

      return matchesSport && matchesLocality;
    });
  }, [turfs, selectedSport, selectedLocality]);

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1">
      {/* Page Title & Mode Switcher */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="inline-flex items-center gap-2 bg-[#ffff94] text-[#03594d] px-4 py-1 rounded-full border-2 border-[#03594d] shadow-maggie-sm text-xs font-black uppercase tracking-wider select-none w-fit">
            <span>
              {mode === 'demo' ? '🤖 MUMBAI DEMO PREVIEWS' : '⚡ LIVE MUMBAI VENUES'} ({turfs.length})
            </span>
          </div>

          {/* Segmented Mode Control */}
          <div className="flex items-center gap-1.5 p-1 bg-[#f9f8f4] border-2 border-[#03594d] rounded-full shadow-maggie-sm w-fit">
            <button
              type="button"
              onClick={() => setMode('live')}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                mode === 'live'
                  ? 'bg-[#03594d] text-[#82eda6] shadow-sm'
                  : 'text-[#03594d] hover:bg-[#ffff94]'
              }`}
            >
              🏟️ Live Arenas
            </button>
            <button
              type="button"
              onClick={() => setMode('demo')}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                mode === 'demo'
                  ? 'bg-[#03594d] text-[#82eda6] shadow-sm'
                  : 'text-[#03594d] hover:bg-[#ffff94]'
              }`}
            >
              🤖 Demo Previews
            </button>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-[#03594d] tracking-tight uppercase leading-[1.05]">
          Find &amp; Book Sports Turfs in Mumbai
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-[#03594d]/80 mt-2 max-w-xl">
          Live slot availability, verified venues, and instant online checkout for Cricket, Football, Tennis, and Pickleball.
        </p>
      </div>

      {/* Demo Environment Notice Banner */}
      {mode === 'demo' && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-[#ffff94] border-2 border-[#03594d] shadow-maggie-sm text-[#03594d] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <span className="text-2xl shrink-0 mt-0.5 sm:mt-0">🤖</span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider">
                Demo Experience • Mumbai Fictional Arenas (Illustrative Preview)
              </p>
              <p className="text-xs font-semibold text-[#03594d]/80 mt-0.5">
                Featuring AI-generated photography and illustrative court diagrams. All bookings use an isolated test checkout simulator with zero real payment.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#03594d] text-[#82eda6] shrink-0 border border-[#03594d]">
            Simulated Booking
          </span>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
        {/* Sports Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {sportsList.map((sport) => (
            <button
              key={sport.value}
              onClick={() => setSelectedSport(sport.value)}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 border-2 border-[#03594d] cursor-pointer ${
                selectedSport === sport.value
                  ? 'bg-[#03594d] text-[#82eda6] shadow-maggie translate-x-0.5 translate-y-0.5'
                  : 'bg-white text-[#03594d] shadow-maggie-sm hover:bg-[#ffff94]'
              }`}
            >
              {sport.iconSrc ? (
                <div className="relative w-5 h-5 rounded-md overflow-hidden shrink-0 border border-[#03594d]">
                  <Image
                    src={sport.iconSrc}
                    alt={sport.label}
                    fill
                    sizes="20px"
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all border-2 border-[#03594d] cursor-pointer ${
                selectedLocality === loc.value
                  ? 'bg-[#03594d] text-[#82eda6] shadow-maggie-sm'
                  : 'bg-white text-[#03594d] shadow-maggie-sm hover:bg-[#ffff94]'
              }`}
            >
              📍 {loc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Venues Grid or Intentional Empty State */}
      {loading ? (
        <div className="p-12 text-center text-sm font-black text-[#03594d]">
          Loading venues...
        </div>
      ) : filteredTurfs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTurfs.map((turf) => (
            <TurfCard key={turf.id} turf={turf} />
          ))}
        </div>
      ) : mode === 'live' && turfs.length === 0 ? (
        /* Intentional Empty State for Live Mode */
        <div className="p-8 sm:p-14 rounded-3xl bg-white border-2 border-[#03594d] shadow-maggie text-center max-w-xl mx-auto">
          <span className="text-5xl block mb-4">🏟️</span>
          <h3 className="text-xl sm:text-2xl font-black text-[#03594d] tracking-tight uppercase mb-2">
            No Live Verified Venues Yet
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-[#03594d]/80 mb-6 max-w-md mx-auto leading-relaxed">
            GoTurf is actively inspecting and onboarding sports turf owners across Mumbai. Real booking slots will appear here as grounds complete verification.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setMode('demo');
                setSelectedSport('all');
                setSelectedLocality('all');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] cursor-pointer transition-all hover:-translate-y-0.5"
            >
              ✨ Explore Interactive Demo Mode
            </button>
            <Link
              href="/owner/new-turf"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-[#03594d] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie-sm hover:bg-[#ffff94] cursor-pointer transition-all"
            >
              🏟️ List Your Venue as Owner
            </Link>
          </div>
        </div>
      ) : (
        /* Filter Reset State */
        <div className="p-10 sm:p-12 rounded-3xl bg-white border-2 border-[#03594d] shadow-maggie text-center max-w-md mx-auto">
          <span className="text-4xl block mb-3">🔍</span>
          <h3 className="text-lg font-black text-[#03594d] mb-1 uppercase tracking-tight">No Matching Arenas</h3>
          <p className="text-xs font-semibold text-[#03594d]/75 mb-5">
            We couldn&apos;t find any {mode === 'demo' ? 'demo ' : ''}venues matching your current sport and locality filters.
          </p>
          <button
            onClick={() => {
              setSelectedSport('all');
              setSelectedLocality('all');
            }}
            className="px-6 py-2.5 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] cursor-pointer transition-all"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
