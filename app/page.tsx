export default function HomePage() {
  const sports = [
    { name: "Box Cricket", icon: "🏏", desc: "Hard turf & net pitches" },
    { name: "Football", icon: "⚽", desc: "5-a-side & 7-a-side arenas" },
    { name: "Tennis", icon: "🎾", desc: "Clay & synthetic courts" },
    { name: "Pickleball", icon: "🏓", desc: "Indoor & outdoor courts" },
  ];

  const localities = [
    "Bandra",
    "Andheri",
    "Powai",
    "Juhu",
    "Borivali",
    "Chembur",
    "South Mumbai",
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-neutral-950/80">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-black text-lg shadow-lg shadow-emerald-500/20">
            GT
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white">GoTurf</span>
            <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Mumbai
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-sm">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-400 select-none"
            title="Private parties, corporate sports days & whole-venue bookings"
          >
            <span className="text-[11px]">🎉</span>
            <span>Events coming soon</span>
          </span>
          <span className="hidden sm:inline-block text-neutral-400">Phase 0 Baseline</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-24 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          Stack Operational: Next.js 16 + React 19 + Tailwind CSS 4
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.1]">
          Book sports turfs across <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Mumbai</span> with live slot precision.
        </h1>

        <p className="mt-5 text-neutral-400 text-base sm:text-lg max-w-2xl leading-relaxed">
          Zero double-bookings, 10-minute temporary holds, instant verified payments, and automated turf owner schedules.
        </p>

        {/* Sports Supported Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 w-full max-w-4xl text-left">
          {sports.map((sport) => (
            <div
              key={sport.name}
              className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-emerald-500/40 transition-colors"
            >
              <div className="text-3xl mb-3">{sport.icon}</div>
              <h3 className="font-semibold text-white text-base">{sport.name}</h3>
              <p className="text-xs text-neutral-400 mt-1">{sport.desc}</p>
            </div>
          ))}
        </div>

        {/* Whole Turf & Corporate Events Placeholder */}
        <div className="mt-6 w-full max-w-4xl p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-sm font-semibold text-white">Whole Turf & Corporate Tournaments</p>
              <p className="text-xs text-neutral-400">Hosting birthday matches, company leagues, or commercial cups?</p>
            </div>
          </div>
          <span className="text-xs font-medium text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl whitespace-nowrap">
            Events coming soon
          </span>
        </div>

        {/* Localities in Mumbai */}
        <div className="mt-10 flex flex-wrap justify-center gap-2 max-w-2xl">
          <span className="text-xs text-neutral-500 self-center mr-2">Pilot Localities:</span>
          {localities.map((loc) => (
            <span
              key={loc}
              className="px-3 py-1 rounded-lg bg-neutral-900 border border-neutral-800/60 text-xs text-neutral-300"
            >
              {loc}
            </span>
          ))}
        </div>
      </section>

      {/* Footer Status */}
      <footer className="border-t border-neutral-800/80 px-6 py-6 text-center text-xs text-neutral-500">
        <p>GoTurf Platform &copy; 2026. Ready for Phase 1: Database Schema & Anti-Overlap Engine.</p>
      </footer>
    </main>
  );
}
