'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export default function MaggieMentalLoad() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Animate chaotic tasks popping up
      gsap.from('.chaotic-task-note', {
        scale: 0.6,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: 'back.out(1.8)',
        scrollTrigger: {
          trigger: '.chaotic-tasks-container',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      // Animate solution box
      gsap.from('.solution-box', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.solution-box',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const chaoticTasks = [
    { text: 'calling turf owner 4 times on WhatsApp', rot: '-rotate-2', bg: '#fccddc' },
    { text: 'chasing 14 players on GPay for ₹150 split', rot: 'rotate-2', bg: '#fdc068' },
    { text: 'reaching the gate & someone else is playing', rot: '-rotate-3', bg: '#aefbff' },
    { text: 'someone canceling at 6:45 PM for 7:00 PM kickoff', rot: 'rotate-3', bg: '#ffff94' },
    { text: 'trying to manually stitch two 1-hour slots together', rot: '-rotate-1', bg: '#f6bbfd' },
    { text: 'arguing about the cash advance token receipt', rot: 'rotate-2', bg: '#fccddc' },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative rounded-t-[50px] sm:rounded-t-[80px] bg-[#f9f8f4] text-[#03594d] border-t-2 border-[#03594d] px-6 py-16 sm:py-24 overflow-hidden"
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Tiny pill badge */}
        <div className="mb-4 inline-flex items-center gap-2 bg-[#fdc068] px-4 py-1.5 rounded-full border-2 border-[#03594d] shadow-maggie-sm text-xs font-black uppercase tracking-wider text-[#03594d] select-none">
          <span>🧠 squad captain relief</span>
        </div>

        {/* Main Headline */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-[#03594d] leading-[1.05] max-w-3xl">
          Our App Is on a Mission to Help Lighten Squad Captains&apos; Mental Load
        </h2>

        {/* Subtitle */}
        <p className="mt-4 text-[#03594d]/80 font-medium text-base sm:text-lg max-w-xl">
          Because organizing a weekend match shouldn&apos;t feel like a high-stress corporate project.
        </p>

        {/* Chaotic task notes floating around */}
        <div className="chaotic-tasks-container mt-10 flex flex-wrap justify-center gap-3 max-w-3xl select-none">
          {chaoticTasks.map((task, idx) => (
            <div
              key={idx}
              style={{ backgroundColor: task.bg }}
              className={`chaotic-task-note px-4 py-2.5 rounded-2xl border-2 border-[#03594d] shadow-maggie-sm font-bold text-xs text-[#03594d] flex items-center gap-2 ${task.rot} transition-transform hover:scale-105`}
            >
              <span className="text-sm">❌</span>
              <span>{task.text}</span>
            </div>
          ))}
        </div>

        {/* Big Solution Box in Mint Green with Pine Borders */}
        <div className="solution-box mt-14 w-full max-w-4xl bg-[#82eda6] rounded-[36px] border-2 border-[#03594d] shadow-maggie-lg p-8 sm:p-12 text-left relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <span className="text-xs font-black uppercase tracking-wider bg-[#03594d] px-3.5 py-1.5 rounded-full text-[#82eda6] shadow-maggie-sm">
                GoTurf Engineered Precision
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#03594d] tracking-tight mt-3">
                How GoTurf Solves It In 30 Seconds:
              </h3>
            </div>
            <div className="font-handwriting text-[#03594d] text-2xl -rotate-2 select-none">
              zero headaches ~
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="p-6 bg-white rounded-2xl border-2 border-[#03594d] shadow-maggie-sm hover:-translate-y-0.5 transition-transform">
              <span className="text-base font-black text-[#03594d] block">
                🔒 10-Minute Mutex Lock
              </span>
              <p className="text-xs text-[#03594d]/80 mt-1.5 font-semibold leading-relaxed">
                Temporary holds freeze the slot in Supabase the instant you start checkout. Nobody can snatch it.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border-2 border-[#03594d] shadow-maggie-sm hover:-translate-y-0.5 transition-transform">
              <span className="text-base font-black text-[#03594d] block">
                🎟️ ₹200 Token Advance
              </span>
              <p className="text-xs text-[#03594d]/80 mt-1.5 font-semibold leading-relaxed">
                Pay a small booking token online, and collect/pay the venue balance in cash or ground UPI upon arrival.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border-2 border-[#03594d] shadow-maggie-sm hover:-translate-y-0.5 transition-transform">
              <span className="text-base font-black text-[#03594d] block">
                🔢 4-Digit Match PIN Pass
              </span>
              <p className="text-xs text-[#03594d]/80 mt-1.5 font-semibold leading-relaxed">
                Digital match pass delivered instantly on your phone. Simply recite your PIN at the gate to kickoff.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border-2 border-[#03594d] shadow-maggie-sm hover:-translate-y-0.5 transition-transform">
              <span className="text-base font-black text-[#03594d] block">
                ⏱️ Continuous 2H & 3H+ Engine
              </span>
              <p className="text-xs text-[#03594d]/80 mt-1.5 font-semibold leading-relaxed">
                Smart multi-hour alternative assistant automatically suggests neighboring continuous time blocks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
