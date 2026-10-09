'use client';

import React from 'react';
import Image from 'next/image';

interface GlassIconProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glowColor?: 'emerald' | 'amber' | 'cyan' | 'purple';
  floating?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12 rounded-xl p-1.5',
  md: 'w-16 h-16 rounded-2xl p-2',
  lg: 'w-24 h-24 rounded-3xl p-3',
  xl: 'w-32 h-32 rounded-3xl p-4',
};

const glowStyles = {
  emerald: 'shadow-[0_0_25px_rgba(16,185,129,0.25)] border-emerald-500/20 group-hover:border-emerald-400/40',
  amber: 'shadow-[0_0_25px_rgba(245,158,11,0.25)] border-amber-500/20 group-hover:border-amber-400/40',
  cyan: 'shadow-[0_0_25px_rgba(6,182,212,0.25)] border-cyan-500/20 group-hover:border-cyan-400/40',
  purple: 'shadow-[0_0_25px_rgba(168,85,247,0.25)] border-purple-500/20 group-hover:border-purple-400/40',
};

export default function GlassIcon({
  src,
  alt,
  size = 'md',
  glowColor = 'emerald',
  floating = false,
  className = '',
}: GlassIconProps) {
  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-b from-white/10 to-white/[0.02] backdrop-blur-2xl border transition-all duration-500 ${
        sizeClasses[size]
      } ${glowStyles[glowColor]} ${floating ? 'animate-float' : ''} ${className}`}
    >
      {/* Specular glass reflection bar across top */}
      <div className="absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      {/* Subtle radial center glow behind 3D render */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-white/5 rounded-inherit pointer-events-none" />

      {/* 3D Icon Render */}
      <div className="relative w-full h-full overflow-hidden rounded-inherit">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100px, 150px"
          className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] transform transition-transform duration-500 group-hover:scale-110"
          priority
        />
      </div>
    </div>
  );
}
