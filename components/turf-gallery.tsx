'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { TurfPhoto } from '@/types/database';
import { getTurfPhotoUrl } from '@/lib/utils/turf-photo';

interface TurfGalleryProps {
  turfName: string;
  photos?: TurfPhoto[];
  primarySport?: string;
}

export default function TurfGallery({
  turfName,
  photos = [],
  primarySport = 'cricket',
}: TurfGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Normalize photos into usable URLs
  const photoList: string[] =
    photos.length > 0
      ? photos.map((p) => getTurfPhotoUrl(p, primarySport))
      : [getTurfPhotoUrl(undefined, primarySport)];

  const currentPhotoUrl = photoList[selectedIndex] || photoList[0];
  const currentCaption = photos[selectedIndex]?.caption || `${turfName} Ground View`;

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
          alt={`${turfName} - photo ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover transition-all duration-300 cursor-pointer"
          onClick={() => setIsFullscreen(true)}
        />

        {/* Gradient Overlay for Top Badges readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#ffff94] text-[#03594d] border border-[#03594d] shadow-maggie-sm flex items-center gap-1.5">
              <span>📸</span>
              <span>Real Venue Photo</span>
            </span>
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#82eda6] text-[#03594d] border border-[#03594d] shadow-maggie-sm">
              ✓ Ground Inspected
            </span>
          </div>

          <button
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
              Photo {selectedIndex + 1} of {photoList.length}
            </span>
            <p className="text-sm sm:text-base font-black drop-shadow-md text-white line-clamp-1">
              {currentCaption}
            </p>
          </div>

          {/* Navigation Controls (If multiple photos) */}
          {photoList.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous Photo"
                className="w-10 h-10 rounded-full bg-white text-[#03594d] border-2 border-[#03594d] shadow-maggie flex items-center justify-center font-black text-sm hover:bg-[#ffff94] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                &larr;
              </button>
              <button
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
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-20 h-16 sm:w-28 sm:h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#03594d] ring-4 ring-[#ffff94] shadow-maggie scale-105'
                    : 'border-[#03594d]/40 opacity-70 hover:opacity-100 hover:border-[#03594d]'
                }`}
              >
                <Image
                  src={url}
                  alt={`${turfName} thumbnail ${idx + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
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
                {turfName} &bull; Photos ({selectedIndex + 1}/{photoList.length})
              </span>
              <span className="text-white/70 text-xs font-semibold">
                Uploaded by venue owner & verified on GoTurf
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
