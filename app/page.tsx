'use client';

import React, { useState } from 'react';
import MaggieNavbar from '@/components/maggie/Navbar';
import MaggieHero from '@/components/maggie/MaggieHero';
import MaggieMarquee from '@/components/maggie/MaggieMarquee';
import MaggieStatement from '@/components/maggie/MaggieStatement';
import MaggieMentalLoad from '@/components/maggie/MaggieMentalLoad';
import MaggieTurfsShowcase from '@/components/maggie/MaggieTurfsShowcase';
import MaggieEvents from '@/components/maggie/MaggieEvents';
import MaggieFooter from '@/components/maggie/MaggieFooter';
import CrystalizedBall from '@/components/ui/CrystalizedBall';

export default function HomePage() {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-[#030303] text-neutral-100 flex flex-col justify-between selection:bg-[#F9B318] selection:text-black relative overflow-hidden">
      {/* Background Ambient Canvas */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 overflow-hidden">
        <CrystalizedBall
          preset="nebula"
          color="#5245F8"
          size={1.6}
          speed={0.4}
          interactive={false}
          glow={0.8}
          haze={0.9}
        />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* 1. Maggie Navbar */}
        <MaggieNavbar />

        {/* 2. Mint Hero Section with Floating Stickers & Handwriting */}
        <MaggieHero />

        {/* 3. Green Running Marquee Ticker */}
        <MaggieMarquee variant="green" />

        {/* 4. Giant Butter Yellow Statement & 3D Sports Grid */}
        <MaggieStatement
          selectedSport={selectedSport}
          onSelectSport={setSelectedSport}
        />

        {/* 5. Yellow Running Marquee Ticker */}
        <MaggieMarquee variant="yellow" />

        {/* 6. Squad Captain's Mental Load & GoTurf Solutions */}
        <MaggieMentalLoad />

        {/* 7. Live Mumbai Turfs Showcase with 3D Sports Badges */}
        <MaggieTurfsShowcase selectedSport={selectedSport} />

        {/* 8. Corporate & Tournaments Showcase with 3D Championship Trophy */}
        <MaggieEvents />

        {/* 9. Neo-Brutalist Grounded Footer with RBI/Razorpay Compliance */}
        <MaggieFooter />
      </div>
    </main>
  );
}
