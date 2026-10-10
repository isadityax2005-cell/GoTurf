'use client';

import React from 'react';

export default function MaggieMentalLoad() {
  const chaoticTasks = [
    { text: 'calling turf owner 4 times on WhatsApp', rot: '-rotate-2' },
    { text: 'chasing 14 players on GPay for ₹150 split', rot: 'rotate-2' },
    { text: 'reaching the gate & someone else is playing', rot: '-rotate-3' },
    { text: 'someone canceling at 6:45 PM for 7:00 PM kickoff', rot: 'rotate-3' },
    { text: 'trying to manually stitch two 1-hour slots together', rot: '-rotate-1' },
    { text: 'arguing about the cash advance token receipt', rot: 'rotate-2' },
  ];

  return (
    <section className="relative rounded-t-[50px] sm:rounded-t-[80px] bg-[#050509] text-white border-t border-[#5245F8]/30 px-6 py-16 sm:py-24 overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Tiny pill badge */}
        <div className="mb-4 inline-flex items-center gap-2 bg-[#5245F8]/20 px-4 py-1.5 rounded-full border border-[#5245F8]/50 shadow-sm shadow-[#5245F8]/30 text-xs font-black uppercase tracking-wider text-[#F9B318] select-none">
          <span>🧠 squad captain relief</span>
        </div>

        {/* Main Headline */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-[1.05] max-w-3xl">
          Our App Is on a Mission to Help Lighten Squad Captains&apos; Mental Load
        </h2>

        {/* Subtitle */}
        <p className="mt-4 text-neutral-400 font-medium text-base sm:text-lg max-w-xl">
          Because organizing a weekend match shouldn&apos;t feel like a high-stress corporate project.
        </p>

        {/* Chaotic task notes floating around */}
        <div className="mt-10 flex flex-wrap justify-center gap-3 max-w-3xl select-none">
          {chaoticTasks.map((task, idx) => (
            <div
              key={idx}
              className={`px-4 py-2.5 rounded-2xl bg-[#0c0c14] border border-[#5245F8]/30 hover:border-[#F9B318]/60 shadow-lg font-bold text-xs text-neutral-200 flex items-center gap-2 ${task.rot} transition-transform hover:scale-105`}
            >
              <span className="text-sm">❌</span>
              <span>{task.text}</span>
            </div>
          ))}
        </div>

        {/* Big Solution Box in Midnight Black & Electric Violet */}
        <div className="mt-14 w-full max-w-4xl bg-[#0c0c14] rounded-[36px] border border-[#5245F8]/40 shadow-[0_0_60px_rgba(82,69,248,0.25)] p-8 sm:p-12 text-left relative overflow-hidden backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <span className="text-xs font-black uppercase tracking-wider bg-[#5245F8] px-3.5 py-1 rounded-full text-white shadow-md">
                GoTurf Engineered Precision
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
                How GoTurf Solves It In 30 Seconds:
              </h3>
            </div>
            <div className="font-handwriting text-[#F9B318] text-xl -rotate-2">
              zero headaches ~
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-[#07070c] rounded-2xl border border-[#5245F8]/30 hover:border-[#5245F8]/60 transition-all">
              <span className="text-base font-black text-white block">
                🔒 10-Minute Mutex Lock
              </span>
              <p className="text-xs text-neutral-400 mt-1 font-medium leading-relaxed">
                Temporary holds freeze the slot in Supabase the instant you start checkout. Nobody can snatch it.
              </p>
            </div>

            <div className="p-5 bg-[#07070c] rounded-2xl border border-[#5245F8]/30 hover:border-[#5245F8]/60 transition-all">
              <span className="text-base font-black text-[#F9B318] block">
                🎟️ ₹200 Token Advance
              </span>
              <p className="text-xs text-neutral-400 mt-1 font-medium leading-relaxed">
                Pay a small booking token online, and collect/pay the venue balance in cash or ground UPI upon arrival.
              </p>
            </div>

            <div className="p-5 bg-[#07070c] rounded-2xl border border-[#5245F8]/30 hover:border-[#5245F8]/60 transition-all">
              <span className="text-base font-black text-white block">
                🔢 4-Digit Match PIN Pass
              </span>
              <p className="text-xs text-neutral-400 mt-1 font-medium leading-relaxed">
                Digital match pass delivered instantly on your phone. Simply recite your PIN at the gate to kickoff.
              </p>
            </div>

            <div className="p-5 bg-[#07070c] rounded-2xl border border-[#5245F8]/30 hover:border-[#5245F8]/60 transition-all">
              <span className="text-base font-black text-[#F9B318] block">
                ⏱️ Continuous 2H & 3H+ Engine
              </span>
              <p className="text-xs text-neutral-400 mt-1 font-medium leading-relaxed">
                Smart multi-hour alternative assistant automatically suggests neighboring continuous time blocks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
