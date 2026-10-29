// ============================================================================
// GoTurf Data Layer: Turfs & Courts
// Interacts with Supabase with seamless demo fallback for offline/preview mode
// ============================================================================

import type { Turf, Court, Region, TurfPhoto, SportType } from '@/types/database';

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
    status: 'hidden',
    is_demo: true,
    created_at: '2026-10-08T00:00:00Z',
    updated_at: '2026-10-08T00:00:00Z',
    photos: [
      {
        id: 'p-bandra-1',
        turf_id: '30000000-0000-0000-0000-000000000001',
        path: '/images/demo-ai/bandra-1.webp',
        caption: 'AI-generated illustrative demo image 1/6: Elevated establishing view of both courts, netting roof and floodlights (fictional venue, not a real venue photograph)',
        sort_order: 0,
        created_at: '2026-10-08T00:00:00Z',
      },
      {
        id: 'p-bandra-2',
        turf_id: '30000000-0000-0000-0000-000000000001',
        path: '/images/demo-ai/bandra-2.webp',
        caption: 'AI-generated illustrative demo image 2/6: Opposite-corner view back across the box-cricket and 5-a-side courts (fictional venue, not a real venue photograph)',
        sort_order: 1,
        created_at: '2026-10-08T00:00:00Z',
      },
      {
        id: 'p-bandra-3',
        turf_id: '30000000-0000-0000-0000-000000000001',
        path: '/images/demo-ai/bandra-3.webp',
        caption: 'AI-generated illustrative demo image 3/6: Sideline view along the covered dugout with bench and water coolers (fictional venue, not a real venue photograph)',
        sort_order: 2,
        created_at: '2026-10-08T00:00:00Z',
      },
      {
        id: 'p-bandra-4',
        turf_id: '30000000-0000-0000-0000-000000000001',
        path: '/images/demo-ai/bandra-4.webp',
        caption: 'AI-generated illustrative demo image 4/6: End-line view toward the 5-a-side goal, cricket pitch beyond the divider (fictional venue, not a real venue photograph)',
        sort_order: 3,
        created_at: '2026-10-08T00:00:00Z',
      },
      {
        id: 'p-bandra-5',
        turf_id: '30000000-0000-0000-0000-000000000001',
        path: '/images/demo-ai/bandra-5.webp',
        caption: 'AI-generated illustrative demo image 5/6: Promenade entrance with gate kiosk leading to the floodlit courts (fictional venue, not a real venue photograph)',
        sort_order: 4,
        created_at: '2026-10-08T00:00:00Z',
      },
      {
        id: 'p-bandra-6',
        turf_id: '30000000-0000-0000-0000-000000000001',
        path: '/images/demo-ai/bandra-6.webp',
        caption: 'AI-generated illustrative demo image 6/6: Turf surface close-up at a white line junction near the penalty area (fictional venue, not a real venue photograph)',
        sort_order: 5,
        created_at: '2026-10-08T00:00:00Z',
      },
    ],
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
    status: 'hidden',
    is_demo: true,
    created_at: '2026-10-08T00:00:00Z',
    updated_at: '2026-10-08T00:00:00Z',
    photos: [
      {
        id: 'p-powai-1',
        turf_id: '30000000-0000-0000-0000-000000000002',
        path: '/images/demo-fallbacks/powai-pickleball-court.webp',
        caption: 'Powai Acrylic Pickleball Court Layout (Illustrative Demo Preview)',
        sort_order: 0,
        created_at: '2026-10-08T00:00:00Z',
      },
      {
        id: 'p-powai-2',
        turf_id: '30000000-0000-0000-0000-000000000002',
        path: '/images/demo-fallbacks/powai-tennis-court.webp',
        caption: 'Regulation Synthetic Hard Court Layout (Illustrative Demo Preview)',
        sort_order: 1,
        created_at: '2026-10-08T00:00:00Z',
      },
    ],
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
    status: 'hidden',
    is_demo: true,
    created_at: '2026-10-08T00:00:00Z',
    updated_at: '2026-10-08T00:00:00Z',
    photos: [
      {
        id: 'p-andheri-1',
        turf_id: '30000000-0000-0000-0000-000000000003',
        path: '/images/demo-fallbacks/andheri-covered-turf.webp',
        caption: 'Andheri Multi-Sport Hub — Covered Facility (Stock photo, illustrative)',
        sort_order: 0,
        created_at: '2026-10-08T00:00:00Z',
      },
      {
        id: 'p-andheri-2',
        turf_id: '30000000-0000-0000-0000-000000000003',
        path: '/images/demo-fallbacks/andheri-night-arena.webp',
        caption: 'Andheri Multi-Sport Hub — Floodlit Arena (Stock photo, illustrative)',
        sort_order: 1,
        created_at: '2026-10-08T00:00:00Z',
      },
    ],
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
  {
    id: '30000000-0000-0000-0000-000000000004',
    owner_id: '20000000-0000-0000-0000-000000000002',
    region_id: '10000000-0000-0000-0000-000000000004',
    name: 'Kurla Cage Arena [Demo]',
    slug: 'kurla-cage-arena-demo',
    address: 'Phoenix Marketcity Link Road, Kurla West, Mumbai 400070 (Fictional Demo Venue)',
    lat: 19.0865,
    lng: 72.8886,
    maps_url: 'https://maps.google.com/?q=19.0865,72.8886',
    facilities: ['Black Mesh Roof Cage', 'LED Floodlights', 'Dugout Seating', 'Drinking Water', 'Changing Rooms'],
    rules: 'Fictional demo venue for preview only. Turf trainers or non-marking futsal soles mandatory.',
    cancellation_rule: 'Simulated demo venue — no real bookings or charges.',
    status: 'approved',
    is_demo: true,
    created_at: '2026-10-08T00:00:00Z',
    updated_at: '2026-10-08T00:00:00Z',
    photos: [
      {
        id: 'p-kurla-1',
        turf_id: '30000000-0000-0000-0000-000000000004',
        path: '/images/demo-fallbacks/kurla-cage-futsal.webp',
        caption: 'Kurla Cage Arena — 6-a-Side Futsal Cage Layout with Black Mesh Roof & Magenta/Black Palette (Illustrative Fallback)',
        sort_order: 0,
        created_at: '2026-10-08T00:00:00Z',
      },
      {
        id: 'p-kurla-2',
        turf_id: '30000000-0000-0000-0000-000000000004',
        path: '/images/demo-fallbacks/kurla-cage-sideline.webp',
        caption: 'Kurla Cage Arena — Overhead Black Mesh Roof & Goal Enclosure View (Illustrative Fallback)',
        sort_order: 1,
        created_at: '2026-10-08T00:00:00Z',
      },
    ],
    region: {
      id: '10000000-0000-0000-0000-000000000004',
      locality: 'Kurla West',
      city: 'Mumbai',
      state: 'Maharashtra',
      created_at: '2026-10-08T00:00:00Z',
    },
    courts: [
      {
        id: '40000000-0000-0000-0000-000000000007',
        turf_id: '30000000-0000-0000-0000-000000000004',
        name: 'Cage 1 - 6v6 Futsal',
        sport: 'football',
        format: '6-a-side Futsal Cage',
        surface: 'Anthracite Turf (Magenta Markings)',
        slot_minutes: 60,
        is_active: true,
        created_at: '2026-10-08T00:00:00Z',
        updated_at: '2026-10-08T00:00:00Z',
      },
    ],
  },
  {
    id: '30000000-0000-0000-0000-000000000005',
    owner_id: '20000000-0000-0000-0000-000000000003',
    region_id: '10000000-0000-0000-0000-000000000005',
    name: 'Juhu Sunrise Padel [Demo]',
    slug: 'juhu-sunrise-padel-demo',
    address: 'Juhu Tara Road, Near Palm Courtyard, Juhu, Mumbai 400049 (Fictional Demo Venue)',
    lat: 19.0988,
    lng: 72.8264,
    maps_url: 'https://maps.google.com/?q=19.0988,72.8264',
    facilities: ['Twin Glass-Walled Padel Courts', 'Terracotta Turf Surface', 'Palm Courtyard', 'Racket Rental', 'Shower Suites'],
    rules: 'Fictional demo venue for preview only. Non-marking padel/tennis court shoes required.',
    cancellation_rule: 'Simulated demo venue — no real bookings or charges.',
    status: 'approved',
    is_demo: true,
    created_at: '2026-10-08T00:00:00Z',
    updated_at: '2026-10-08T00:00:00Z',
    photos: [
      {
        id: 'p-juhu-1',
        turf_id: '30000000-0000-0000-0000-000000000005',
        path: '/images/demo-fallbacks/juhu-sunrise-padel.webp',
        caption: 'Juhu Sunrise Padel — Twin Glass-Walled Padel Courts with Palm Trees & Terracotta Surface (Illustrative Fallback)',
        sort_order: 0,
        created_at: '2026-10-08T00:00:00Z',
      },
      {
        id: 'p-juhu-2',
        turf_id: '30000000-0000-0000-0000-000000000005',
        path: '/images/demo-fallbacks/juhu-padel-glass.webp',
        caption: 'Juhu Sunrise Padel — 12mm Tempered Glass Rebound Walls & Terracotta Turf View (Illustrative Fallback)',
        sort_order: 1,
        created_at: '2026-10-08T00:00:00Z',
      },
    ],
    region: {
      id: '10000000-0000-0000-0000-000000000005',
      locality: 'Juhu',
      city: 'Mumbai',
      state: 'Maharashtra',
      created_at: '2026-10-08T00:00:00Z',
    },
    courts: [
      {
        id: '40000000-0000-0000-0000-000000000008',
        turf_id: '30000000-0000-0000-0000-000000000005',
        name: 'Court 1 - Sunrise Glass Padel',
        sport: 'tennis',
        format: 'Glass-Walled Padel (Doubles)',
        surface: 'Terracotta Monofilament Turf',
        slot_minutes: 60,
        is_active: true,
        created_at: '2026-10-08T00:00:00Z',
        updated_at: '2026-10-08T00:00:00Z',
      },
      {
        id: '40000000-0000-0000-0000-000000000009',
        turf_id: '30000000-0000-0000-0000-000000000005',
        name: 'Court 2 - Championship Padel',
        sport: 'pickleball',
        format: 'Glass-Walled Padel / Pickleball',
        surface: 'Terracotta Monofilament Turf',
        slot_minutes: 60,
        is_active: true,
        created_at: '2026-10-08T00:00:00Z',
        updated_at: '2026-10-08T00:00:00Z',
      },
    ],
  },
];

// In-memory store for pending/newly submitted turfs during demo
const pendingStore: Turf[] = [];

export function getDemoTurfByCourtId(courtId: string): Turf | null {
  for (const turf of DEMO_TURFS) {
    if (turf.courts?.some((c) => c.id === courtId)) {
      return turf;
    }
  }
  return null;
}

export function getDemoCourtById(courtId: string): Court | null {
  for (const turf of DEMO_TURFS) {
    const found = turf.courts?.find((c) => c.id === courtId);
    if (found) return found;
  }
  return null;
}

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

export function getDemoTurfs(): Turf[] {
  return DEMO_TURFS.filter((t) => t.status === 'approved');
}

export async function fetchLiveApprovedTurfs(mode?: 'live' | 'demo'): Promise<Turf[]> {
  // When explicitly requesting demo mode, return only approved demo preview venues
  if (mode === 'demo') {
    return DEMO_TURFS.filter((t) => t.status === 'approved');
  }

  // When forced into offline demo-only harness without database
  if (mode !== 'live' && process.env.GOTURF_DEMO_ONLY === 'true') {
    return DEMO_TURFS.filter((t) => t.status === 'approved');
  }

  try {
    const { getServiceRoleClient } = await import('@/lib/supabase');
    const supabaseAdmin = getServiceRoleClient();

    // Query strictly genuine owner-submitted and approved venues (excluding demo records)
    const { data: dbTurfsData, error: tErr } = await supabaseAdmin
      .from('turfs')
      .select('*')
      .eq('status', 'approved')
      .eq('is_demo', false)
      .order('created_at', { ascending: false });

    const dbTurfs = dbTurfsData as unknown as Turf[] | null;

    if (tErr) {
      console.warn('fetchLiveApprovedTurfs Supabase error:', tErr);
      return [];
    }

    if (!dbTurfs || dbTurfs.length === 0) {
      // Genuine catalogue has zero real owner listings yet
      return [];
    }

    const [{ data: regionsData }, { data: courtsData }, { data: photosData }] = await Promise.all([
      supabaseAdmin.from('regions').select('*'),
      supabaseAdmin.from('courts').select('*'),
      supabaseAdmin.from('turf_photos').select('*').order('sort_order', { ascending: true }),
    ]);

    const regions = (regionsData as unknown as Region[] | null) || [];
    const courts = (courtsData as unknown as Court[] | null) || [];
    const photos = (photosData as unknown as TurfPhoto[] | null) || [];

    const regionMap = new Map<string, Region>(regions.map((r) => [r.id, r]));

    const enrichedDbTurfs: Turf[] = dbTurfs.map((t) => {
      const region: Region = regionMap.get(t.region_id) || {
        id: t.region_id,
        locality: 'Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        created_at: t.created_at,
      };

      const turfCourts = courts.filter((c) => c.turf_id === t.id);
      const turfPhotos = photos.filter((p) => p.turf_id === t.id);

      return {
        ...t,
        region,
        courts: turfCourts.length > 0 ? turfCourts : [
          {
            id: `court-${t.id}-1`,
            turf_id: t.id,
            name: 'Main Arena',
            sport: 'cricket' as const,
            format: 'Box Cricket',
            surface: 'Artificial Grass',
            slot_minutes: 60,
            is_active: true,
            created_at: t.created_at,
            updated_at: t.updated_at,
          },
        ],
        photos: turfPhotos,
      };
    });

    return enrichedDbTurfs;
  } catch (err) {
    console.error('fetchLiveApprovedTurfs exception:', err);
    return [];
  }
}

export async function fetchTurfBySlug(slug: string): Promise<Turf | null> {
  // Fast-path for known demo turfs so demo flows never need to query Supabase
  const demoFound = DEMO_TURFS.find((t) => t.slug === slug);
  if (demoFound && demoFound.status === 'approved') {
    return demoFound;
  }

  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true' && process.env.GOTURF_DEMO_ONLY !== 'true') {
    try {
      const { getServiceRoleClient } = await import('@/lib/supabase');
      const supabaseAdmin = getServiceRoleClient();
      const { data: turfData } = await supabaseAdmin
        .from('turfs')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      const turf = turfData as unknown as Turf | null;

      if (turf && turf.status === 'approved') {
        const [{ data: regionData }, { data: courtsData }, { data: photosData }] = await Promise.all([
          supabaseAdmin.from('regions').select('*').eq('id', turf.region_id).maybeSingle(),
          supabaseAdmin.from('courts').select('*').eq('turf_id', turf.id),
          supabaseAdmin.from('turf_photos').select('*').eq('turf_id', turf.id).order('sort_order', { ascending: true }),
        ]);

        const region = regionData as unknown as Region | null;
        const courts = (courtsData as unknown as Court[] | null) || [];
        const photos = (photosData as unknown as TurfPhoto[] | null) || [];

        return {
          ...turf,
          region: region || {
            id: turf.region_id,
            locality: 'Mumbai',
            city: 'Mumbai',
            state: 'Maharashtra',
            created_at: turf.created_at,
          },
          courts: courts.length > 0 ? courts : [
            {
              id: `court-${turf.id}-1`,
              turf_id: turf.id,
              name: 'Main Arena',
              sport: 'cricket',
              format: 'Box Cricket',
              surface: 'Artificial Grass',
              slot_minutes: 60,
              is_active: true,
              created_at: turf.created_at,
              updated_at: turf.updated_at,
            },
          ],
          photos,
        };
      }
    } catch (err) {
      console.warn('fetchTurfBySlug Supabase query warning, falling back to local store:', err);
    }
  }

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
