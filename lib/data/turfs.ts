// ============================================================================
// GoTurf Data Layer: Turfs & Courts
// Interacts with Supabase with seamless demo fallback for offline/preview mode
// ============================================================================

import type { Turf, SportType } from '@/types/database';

// In-memory demo store representing seed data for instant local demoing
export const DEMO_TURFS: Turf[] = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    owner_id: '20000000-0000-0000-0000-000000000002',
    region_id: '10000000-0000-0000-0000-000000000001',
    name: 'Bandra Turf Arena [Demo]',
    slug: 'bandra-turf-arena-demo',
    address: 'Carter Road Promenade, Bandra West, Mumbai 400050',
    lat: 19.0653,
    lng: 72.8258,
    maps_url: 'https://maps.google.com/?q=19.0653,72.8258',
    facilities: ['Floodlights', 'Free Parking', 'Changing Rooms', 'Drinking Water', 'Bibs & Match Balls'],
    rules: 'Flat turf shoes or studs recommended. No metal spikes. Reach 10 minutes prior.',
    cancellation_rule: 'Full refund if cancelled up to 24 hours before the match. No refund after 24h window.',
    status: 'approved',
    is_demo: true,
    created_at: '2026-10-08T00:00:00Z',
    updated_at: '2026-10-08T00:00:00Z',
    region: {
      id: '10000000-0000-0000-0000-000000000001',
      locality: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      created_at: '2026-10-08T00:00:00Z',
    },
    courts: [
      {
        id: '40000000-0000-0000-0000-000000000001',
        turf_id: '30000000-0000-0000-0000-000000000001',
        name: 'Court 1 - Box Cricket',
        sport: 'cricket',
        format: 'Box Cricket (8v8)',
        surface: 'Artificial Turf',
        slot_minutes: 60,
        is_active: true,
        created_at: '2026-10-08T00:00:00Z',
        updated_at: '2026-10-08T00:00:00Z',
      },
      {
        id: '40000000-0000-0000-0000-000000000002',
        turf_id: '30000000-0000-0000-0000-000000000001',
        name: 'Arena B - Football',
        sport: 'football',
        format: '5-a-side Football',
        surface: 'FIFA-grade 50mm Turf',
        slot_minutes: 60,
        is_active: true,
        created_at: '2026-10-08T00:00:00Z',
        updated_at: '2026-10-08T00:00:00Z',
      },
    ],
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    owner_id: '20000000-0000-0000-0000-000000000003',
    region_id: '10000000-0000-0000-0000-000000000002',
    name: 'Powai Smash & Volley Club [Demo]',
    slug: 'powai-smash-club-demo',
    address: 'Hiranandani Gardens, Central Avenue, Powai, Mumbai 400076',
    lat: 19.1176,
    lng: 72.9060,
    maps_url: 'https://maps.google.com/?q=19.1176,72.9060',
    facilities: ['Floodlights', 'Cushioned Acrylic Flooring', 'Paddles on Rent', 'Locker Room', 'Sports Cafe'],
    rules: 'Non-marking court shoes compulsory. Paddle rental available at counter.',
    cancellation_rule: 'Full refund up to 12 hours prior to slot. 50% refund between 4 to 12 hours.',
    status: 'approved',
    is_demo: true,
    created_at: '2026-10-08T00:00:00Z',
    updated_at: '2026-10-08T00:00:00Z',
    region: {
      id: '10000000-0000-0000-0000-000000000002',
      locality: 'Powai',
      city: 'Mumbai',
      state: 'Maharashtra',
      created_at: '2026-10-08T00:00:00Z',
    },
    courts: [
      {
        id: '40000000-0000-0000-0000-000000000003',
        turf_id: '30000000-0000-0000-0000-000000000002',
        name: 'Court A - Pickleball',
        sport: 'pickleball',
        format: 'Doubles / Singles',
        surface: 'Cushioned Acrylic',
        slot_minutes: 60,
        is_active: true,
        created_at: '2026-10-08T00:00:00Z',
        updated_at: '2026-10-08T00:00:00Z',
      },
      {
        id: '40000000-0000-0000-0000-000000000004',
        turf_id: '30000000-0000-0000-0000-000000000002',
        name: 'Court 1 - Tennis',
        sport: 'tennis',
        format: 'Regulation Tennis Court',
        surface: 'Synthetic Hard Court',
        slot_minutes: 60,
        is_active: true,
        created_at: '2026-10-08T00:00:00Z',
        updated_at: '2026-10-08T00:00:00Z',
      },
    ],
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    owner_id: '20000000-0000-0000-0000-000000000004',
    region_id: '10000000-0000-0000-0000-000000000003',
    name: 'Andheri Multi-Sport Hub [Demo]',
    slug: 'andheri-multi-sport-hub-demo',
    address: 'Chakala Metro Station Road, Andheri East, Mumbai 400093',
    lat: 19.1136,
    lng: 72.8697,
    maps_url: 'https://maps.google.com/?q=19.1136,72.8697',
    facilities: ['All-Weather Covered Shed', 'High-Beam LED Floodlights', 'Spectator Seating', 'Refreshments'],
    rules: 'Only rubber studs allowed. Smoking and alcohol strictly prohibited on premises.',
    cancellation_rule: 'Full refund up to 24 hours before game.',
    status: 'approved',
    is_demo: true,
    created_at: '2026-10-08T00:00:00Z',
    updated_at: '2026-10-08T00:00:00Z',
    region: {
      id: '10000000-0000-0000-0000-000000000003',
      locality: 'Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      created_at: '2026-10-08T00:00:00Z',
    },
    courts: [
      {
        id: '40000000-0000-0000-0000-000000000005',
        turf_id: '30000000-0000-0000-0000-000000000003',
        name: 'Pitch 1 - Box Cricket',
        sport: 'cricket',
        format: 'Box Cricket (7v7)',
        surface: 'High-Density Turf',
        slot_minutes: 60,
        is_active: true,
        created_at: '2026-10-08T00:00:00Z',
        updated_at: '2026-10-08T00:00:00Z',
      },
      {
        id: '40000000-0000-0000-0000-000000000006',
        turf_id: '30000000-0000-0000-0000-000000000003',
        name: 'Court 1 - Pickleball',
        sport: 'pickleball',
        format: 'Doubles Regulation',
        surface: 'Multi-Sport Polymeric',
        slot_minutes: 60,
        is_active: true,
        created_at: '2026-10-08T00:00:00Z',
        updated_at: '2026-10-08T00:00:00Z',
      },
    ],
  },
];

// In-memory store for pending/newly submitted turfs during demo
let pendingStore: Turf[] = [];

export function getApprovedTurfs(filter?: { sport?: SportType | 'all'; locality?: string }): Turf[] {
  let list = DEMO_TURFS.filter((t) => t.status === 'approved');

  if (filter?.locality && filter.locality !== 'all') {
    list = list.filter((t) => t.region?.locality.toLowerCase() === filter.locality?.toLowerCase());
  }

  if (filter?.sport && filter.sport !== 'all') {
    list = list.filter((t) => t.courts?.some((c) => c.sport === filter.sport && c.is_active));
  }

  return list;
}

export function getTurfBySlug(slug: string): Turf | null {
  const found = DEMO_TURFS.find((t) => t.slug === slug);
  if (found && found.status === 'approved') return found;
  
  // Check if it exists in pending store
  const pending = pendingStore.find((t) => t.slug === slug);
  return pending || null;
}

export function createPendingTurf(newTurf: Omit<Turf, 'id' | 'created_at' | 'updated_at' | 'status'>): Turf {
  const turf: Turf = {
    ...newTurf,
    id: `turf-pending-${Date.now()}`,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  pendingStore.push(turf);
  return turf;
}

export function getPendingTurfs(): Turf[] {
  return pendingStore;
}

export function approveTurf(id: string): boolean {
  const index = pendingStore.findIndex((t) => t.id === id);
  if (index !== -1) {
    const approved = { ...pendingStore[index], status: 'approved' as const };
    pendingStore.splice(index, 1);
    DEMO_TURFS.push(approved);
    return true;
  }
  return false;
}
