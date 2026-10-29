import type { TurfPhoto } from '@/types/database';

const SUPABASE_STORAGE_URL = 'https://wedsiefskyzvnbooscuf.supabase.co/storage/v1/object/public/turf-photos';

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

export function getIllustrativeSportFallback(sportFallback = 'cricket'): string {
  const key = (sportFallback || 'cricket').toLowerCase();
  return ILLUSTRATIVE_SPORT_FALLBACKS[key] || ILLUSTRATIVE_SPORT_FALLBACKS.cricket;
}

export function isAiGeneratedPhotoUrl(url?: string | null): boolean {
  return Boolean(url && url.startsWith('/images/demo-ai/'));
}

export function isIllustrativePhotoUrl(url?: string | null): boolean {
  if (!url) return true;
  return (
    url.startsWith('/images/demo-fallbacks/') ||
    url.startsWith('/images/demo-ai/') ||
    url.startsWith('/icons/') ||
    url.includes('images.unsplash.com')
  );
}

/**
 * Resolves a turf photo or path into a fully qualified image URL.
 * Handles full URLs, Supabase relative storage paths, and clearly labelled illustrative fallbacks.
 */
export function getTurfPhotoUrl(
  photoOrPath?: string | TurfPhoto | null,
  sportFallback = 'cricket'
): string {
  if (!photoOrPath) {
    return getIllustrativeSportFallback(sportFallback);
  }

  const raw = typeof photoOrPath === 'string' ? photoOrPath : photoOrPath.path;
  if (!raw || typeof raw !== 'string' || raw.trim().length === 0) {
    return getIllustrativeSportFallback(sportFallback);
  }

  const trimmed = raw.trim();
  if (KNOWN_BROKEN_DEMO_URLS.some((broken) => trimmed.includes(broken))) {
    return getIllustrativeSportFallback(sportFallback);
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }

  return `${SUPABASE_STORAGE_URL}/${trimmed.replace(/^\/+/, '')}`;
}
