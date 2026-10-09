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

export default function HomePage() {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col justify-between selection:bg-[#ffff94] selection:text-[#03594d]">
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
    </main>
  );
}
