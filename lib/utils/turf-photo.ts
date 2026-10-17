import type { TurfPhoto } from '@/types/database';

const SUPABASE_STORAGE_URL = 'https://wedsiefskyzvnbooscuf.supabase.co/storage/v1/object/public/turf-photos';

const DEFAULT_SPORT_IMAGES: Record<string, string> = {
  cricket: 'https://images.unsplash.com/photo-1529900245534-47fbf82a44dd?auto=format&fit=crop&w=1200&q=80',
  football: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
  tennis: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80',
  pickleball: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
};

/**
 * Resolves a turf photo or path into a fully qualified image URL.
 * Handles full URLs, Supabase relative storage paths, and sport-specific high-res defaults.
 */
export function getTurfPhotoUrl(
  photoOrPath?: string | TurfPhoto | null,
  sportFallback = 'cricket'
): string {
  if (!photoOrPath) {
    return DEFAULT_SPORT_IMAGES[sportFallback.toLowerCase()] || DEFAULT_SPORT_IMAGES.cricket;
  }

  const raw = typeof photoOrPath === 'string' ? photoOrPath : photoOrPath.path;
  if (!raw || typeof raw !== 'string' || raw.trim().length === 0) {
    return DEFAULT_SPORT_IMAGES[sportFallback.toLowerCase()] || DEFAULT_SPORT_IMAGES.cricket;
  }

  const trimmed = raw.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }

  return `${SUPABASE_STORAGE_URL}/${trimmed.replace(/^\/+/, '')}`;
}
