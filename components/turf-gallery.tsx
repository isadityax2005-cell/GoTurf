'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { TurfPhoto } from '@/types/database';
import {
  getTurfPhotoUrl,
  getIllustrativeSportFallback,
  isAiGeneratedPhotoUrl,
  isIllustrativePhotoUrl,
  VENUE_PHOTO_UNAVAILABLE_PATH,
} from '@/lib/utils/turf-photo';

interface TurfGalleryProps {
  turfName: string;
  photos?: TurfPhoto[];
  primarySport?: string;
  isDemo?: boolean;
}

export default function TurfGallery({
  turfName,
  photos = [],
  primarySport = 'cricket',
  isDemo = false,
}: TurfGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>({});

  // Normalize photos into usable URLs
  const photoList: string[] =
    photos.length > 0
      ? photos.map((p) => getTurfPhotoUrl(p, primarySport, isDemo))
      : [isDemo ? getIllustrativeSportFallback(primarySport) : VENUE_PHOTO_UNAVAILABLE_PATH];

  const safeIndex = selectedIndex < photoList.length ? selectedIndex : 0;
  const fallbackUrl = isDemo ? getIllustrativeSportFallback(primarySport) : VENUE_PHOTO_UNAVAILABLE_PATH;
  const currentPhotoUrl = failedIndices[safeIndex]
    ? fallbackUrl
    : photoList[safeIndex] || fallbackUrl;

  const isUnavailable = !isDemo && currentPhotoUrl === VENUE_PHOTO_UNAVAILABLE_PATH;
  const isAiGenerated = !failedIndices[safeIndex] && isAiGeneratedPhotoUrl(currentPhotoUrl);
  const isStockPhoto =
    currentPhotoUrl.includes('images.unsplash.com') ||
    Boolean(photos[safeIndex]?.caption?.toLowerCase().includes('stock photo'));
  const isIllustrative = isDemo || Boolean(failedIndices[safeIndex]) || isIllustrativePhotoUrl(currentPhotoUrl);

  const currentCaption = isUnavailable
    ? `${turfName} — Venue Photo Unavailable (Ground inspection pending)`
    : failedIndices[safeIndex]
      ? `${turfName} — Illustrative Court Fallback Diagram`
      : photos[safeIndex]?.caption ||
        (isIllustrative
          ? `${turfName} — Illustrative Demo Preview`
          : `${turfName} Ground View`);

  const handleImageError = (index: number) => {
    setFailedIndices((prev) => (prev[index] ? prev : { ...prev, [index]: true }));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % photoList.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + photoList.length) % photoList.length);
  };

  return (
    <div className="mb-8">
      {/* Main Showcase Hero Frame */}
      <div className="relative rounded-[32px] overflow-hidden border-2 border-[#03594d] shadow-maggie-lg bg-[#03594d]/10 aspect-[16/9] sm:aspect-[21/9]">
        <Image
          src={currentPhotoUrl}
          alt={
            isAiGenerated
              ? `${turfName} AI-generated illustrative demo image ${safeIndex + 1}`
              : isIllustrative
                ? `${turfName} illustrative court diagram ${safeIndex + 1}`
                : `${turfName} venue photo ${safeIndex + 1}`
          }
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover transition-all duration-300 cursor-pointer"
          onClick={() => setIsFullscreen(true)}
          onError={() => handleImageError(safeIndex)}
        />

        {/* Gradient Overlay for Top Badges readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            {isUnavailable ? (
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#ffff94] text-[#03594d] border border-[#03594d] shadow-maggie-sm flex items-center gap-1.5">
                <span>📷</span>
                <span>Venue Photo Unavailable</span>
              </span>
            ) : isIllustrative ? (
              <>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#ffff94] text-[#03594d] border border-[#03594d] shadow-maggie-sm flex items-center gap-1.5">
                  <span>{isAiGenerated ? '🤖' : isStockPhoto ? '📷' : '🎨'}</span>
                  <span>
                    {isAiGenerated
                      ? 'AI-generated illustrative demo image'
                      : isStockPhoto
                        ? 'Stock photo, illustrative'
                        : 'Illustrative Demo Preview'}
                  </span>
                </span>
                <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#82eda6] text-[#03594d] border border-[#03594d] shadow-maggie-sm">
                  Fictional Venue &bull; Not a Real Venue Photograph
                </span>
              </>
            ) : (
              <>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#ffff94] text-[#03594d] border border-[#03594d] shadow-maggie-sm flex items-center gap-1.5">
                  <span>📸</span>
                  <span>Verified Venue Photo</span>
                </span>
                <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#82eda6] text-[#03594d] border border-[#03594d] shadow-maggie-sm">
                  ✓ Ground Inspected
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/90 text-[#03594d] border border-[#03594d] shadow-maggie-sm hover:bg-[#ffff94] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>🔍</span>
            <span>Expand</span>
          </button>
        </div>

        {/* Bottom Banner: Caption & Navigation */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10 text-white">
          <div className="max-w-[70%]">
            <span className="text-[11px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 inline-block mb-1">
              {isIllustrative ? 'Illustration' : 'Photo'} {safeIndex + 1} of {photoList.length}
            </span>
            <p className="text-sm sm:text-base font-black drop-shadow-md text-white line-clamp-1">
              {currentCaption}
            </p>
          </div>

          {/* Navigation Controls (If multiple photos) */}
          {photoList.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Photo"
                className="w-10 h-10 rounded-full bg-white text-[#03594d] border-2 border-[#03594d] shadow-maggie flex items-center justify-center font-black text-sm hover:bg-[#ffff94] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                &larr;
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Photo"
                className="w-10 h-10 rounded-full bg-white text-[#03594d] border-2 border-[#03594d] shadow-maggie flex items-center justify-center font-black text-sm hover:bg-[#ffff94] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails Strip (When 2+ photos) */}
      {photoList.length > 1 && (
        <div className="mt-3 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {photoList.map((url, idx) => {
            const isSelected = idx === safeIndex;
            const thumbSrc = failedIndices[idx] ? fallbackUrl : url;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-20 h-16 sm:w-28 sm:h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#03594d] ring-4 ring-[#ffff94] shadow-maggie scale-105'
                    : 'border-[#03594d]/40 opacity-70 hover:opacity-100 hover:border-[#03594d]'
                }`}
              >
                <Image
                  src={thumbSrc}
                  alt={`${turfName} thumbnail ${idx + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                  onError={() => handleImageError(idx)}
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-[#ffff94]/20 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Top Bar */}
          <div
            className="flex items-center justify-between z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <span className="text-white text-base sm:text-lg font-black tracking-tight block">
                {turfName} &bull; {isIllustrative ? 'Illustrative Preview' : 'Photos'} ({safeIndex + 1}/{photoList.length})
              </span>
              <span className="text-white/70 text-xs font-semibold">
                {isIllustrative
                  ? isAiGenerated
                    ? 'Fictional demo venue • AI-generated illustrative image (not a real venue photograph)'
                    : 'Fictional demo venue • Illustrative fallback asset (not real venue photography)'
                  : 'Uploaded by venue owner & verified on GoTurf'}
              </span>
            </div>

            <button
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-2 rounded-full bg-[#ffff94] text-[#03594d] border-2 border-[#03594d] shadow-maggie text-xs font-black uppercase tracking-wider hover:bg-white transition-all cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          {/* Centered High-Res Photo */}
          <div
            className="relative flex-1 w-full max-w-5xl mx-auto my-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full max-h-[75vh]">
              <Image
                src={currentPhotoUrl}
                alt={`${turfName} full resolution`}
                fill
                sizes="100vw"
                className="object-contain rounded-2xl"
                onError={() => handleImageError(safeIndex)}
              />
            </div>

            {/* Modal Next / Prev */}
            {photoList.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white text-[#03594d] border-2 border-[#03594d] shadow-maggie flex items-center justify-center font-black text-lg hover:bg-[#ffff94] transition-all cursor-pointer"
                >
                  &larr;
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white text-[#03594d] border-2 border-[#03594d] shadow-maggie flex items-center justify-center font-black text-lg hover:bg-[#ffff94] transition-all cursor-pointer"
                >
                  &rarr;
                </button>
              </>
            )}
          </div>

          {/* Bottom Caption */}
          <div
            className="text-center text-white/90 text-xs sm:text-sm font-bold z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {currentCaption} &bull; Tap or click anywhere outside to close
          </div>
        </div>
      )}
    </div>
  );
}
