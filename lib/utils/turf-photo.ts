import type { Turf, TurfPhoto } from '@/types/database';

const SUPABASE_STORAGE_URL = 'https://wedsiefskyzvnbooscuf.supabase.co/storage/v1/object/public/turf-photos';

export const VENUE_PHOTO_UNAVAILABLE_PATH = '/images/placeholders/venue-photo-unavailable.webp';

export const ILLUSTRATIVE_SPORT_FALLBACKS: Record<string, string> = {
  cricket: '/images/demo-fallbacks/bandra-cricket-turf.webp',
  football: '/images/demo-fallbacks/bandra-football-turf.webp',
  tennis: '/images/demo-fallbacks/powai-tennis-court.webp',
  pickleball: '/images/demo-fallbacks/powai-pickleball-court.webp',
};

const KNOWN_BROKEN_DEMO_URLS = [
  'photo-1529900245534-47fbf82a44dd',
  'photo-1518604666864-742395639543',
];

// Test uploads with unrelated political news graphics or memes submitted during QA
export const KNOWN_UNRELATED_OR_TEST_PATHS = [
  'turf_1792250112755_azfedd', // Cool turf political YouTube thumbnail
  'turf_1792248608009_ctipjf', // India plays turf Kanye bear cartoon
];

export function getIllustrativeSportFallback(sportFallback = 'cricket'): string {
  const key = (sportFallback || 'cricket').toLowerCase();
  return ILLUSTRATIVE_SPORT_FALLBACKS[key] || ILLUSTRATIVE_SPORT_FALLBACKS.cricket;
}

export function isAiGeneratedPhotoUrl(url?: string | null): boolean {
  return Boolean(url && url.startsWith('/images/demo-ai/'));
}

export function isPhotoUnavailable(url?: string | null): boolean {
  return !url || url === VENUE_PHOTO_UNAVAILABLE_PATH;
}

export function isIllustrativePhotoUrl(url?: string | null): boolean {
  if (!url) return true;
  return (
    url.startsWith('/images/demo-fallbacks/') ||
    url.startsWith('/images/demo-ai/') ||
    url.startsWith('/icons/') ||
    url.includes('images.unsplash.com') ||
    url === VENUE_PHOTO_UNAVAILABLE_PATH
  );
}

/**
 * Resolves a turf photo or path into a fully qualified image URL.
 * Handles full URLs, Supabase relative storage paths, neutral unavailable placeholders, and illustrative fallbacks.
 */
export function getTurfPhotoUrl(
  photoOrPath?: string | TurfPhoto | null,
  sportFallback = 'cricket',
  isDemo = false
): string {
  if (!photoOrPath) {
    return isDemo ? getIllustrativeSportFallback(sportFallback) : VENUE_PHOTO_UNAVAILABLE_PATH;
  }

  const raw = typeof photoOrPath === 'string' ? photoOrPath : photoOrPath.path;
  if (!raw || typeof raw !== 'string' || raw.trim().length === 0) {
    return isDemo ? getIllustrativeSportFallback(sportFallback) : VENUE_PHOTO_UNAVAILABLE_PATH;
  }

  const trimmed = raw.trim();

  // If the photo is a known unrelated or test asset, show neutral unavailable placeholder
  if (KNOWN_UNRELATED_OR_TEST_PATHS.some((p) => trimmed.includes(p))) {
    return VENUE_PHOTO_UNAVAILABLE_PATH;
  }

  if (KNOWN_BROKEN_DEMO_URLS.some((broken) => trimmed.includes(broken))) {
    return getIllustrativeSportFallback(sportFallback);
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }

  return `${SUPABASE_STORAGE_URL}/${trimmed.replace(/^\/+/, '')}`;
}

export interface TurfDisplayPhotoInfo {
  photoUrl: string;
  isAiGenerated: boolean;
  isStockPhoto: boolean;
  isIllustrative: boolean;
  isUnavailable: boolean;
  badgeLabel: string;
  altText: string;
}

export function resolveTurfDisplayPhoto(turf: Turf, imageFailed = false): TurfDisplayPhotoInfo {
  const sports = Array.from(new Set(turf.courts?.map((c) => c.sport) || []));
  const primarySport = sports[0] || 'cricket';
  const firstPhoto = turf.photos?.[0];

  // 1. Real Listings (!turf.is_demo)
  if (!turf.is_demo) {
    const rawUrl = firstPhoto ? getTurfPhotoUrl(firstPhoto, primarySport, false) : null;
    const isUnavailable = imageFailed || !rawUrl || rawUrl === VENUE_PHOTO_UNAVAILABLE_PATH;

    if (isUnavailable) {
      return {
        photoUrl: VENUE_PHOTO_UNAVAILABLE_PATH,
        isAiGenerated: false,
        isStockPhoto: false,
        isIllustrative: false,
        isUnavailable: true,
        badgeLabel: '📷 Venue photo unavailable',
        altText: `${turf.name} — Venue photo unavailable (ground inspection pending)`,
      };
    }

    return {
      photoUrl: rawUrl,
      isAiGenerated: false,
      isStockPhoto: false,
      isIllustrative: false,
      isUnavailable: false,
      badgeLabel: turf.status === 'approved' ? '✓ Registered Arena' : 'Inspection Pending',
      altText: `${turf.name} venue photo`,
    };
  }

  // 2. Demo Venues (turf.is_demo === true)
  if (imageFailed) {
    const fallbackUrl = getIllustrativeSportFallback(primarySport);
    return {
      photoUrl: fallbackUrl,
      isAiGenerated: false,
      isStockPhoto: false,
      isIllustrative: true,
      isUnavailable: false,
      badgeLabel: '🎨 Demo • Illustrative',
      altText: `${turf.name} — Illustrative court diagram`,
    };
  }

  const resolvedUrl = getTurfPhotoUrl(firstPhoto, primarySport, true);
  const isAiGen = isAiGeneratedPhotoUrl(resolvedUrl);
  const isStock =
    resolvedUrl.includes('images.unsplash.com') ||
    Boolean(firstPhoto?.caption?.toLowerCase().includes('stock photo'));

  let badgeLabel = '🎨 Demo • Illustrative';
  let altText = `${turf.name} — Illustrative demo preview`;

  if (isAiGen) {
    badgeLabel = '🤖 Demo • AI-generated image';
    altText = `${turf.name} — AI-generated illustrative demo image`;
  } else if (isStock) {
    badgeLabel = '📷 Stock photo, illustrative';
    altText = `${turf.name} — Stock photo, illustrative (fictional demo venue)`;
  }

  return {
    photoUrl: resolvedUrl,
    isAiGenerated: isAiGen,
    isStockPhoto: isStock,
    isIllustrative: true,
    isUnavailable: false,
    badgeLabel,
    altText,
  };
}
