import { Suspense } from 'react';
import { fetchLiveApprovedTurfs } from '@/lib/data/turfs';
import TurfsDiscoveryClient from '@/components/turfs-discovery-client';
import MaggieNavbar from '@/components/maggie/Navbar';
import MaggieFooter from '@/components/maggie/MaggieFooter';

export const metadata = {
  title: 'Sports Turfs in Mumbai • Book Cricket, Football, Tennis & Pickleball | GoTurf',
  description: 'Verified sports turfs in Mumbai with real-time slot booking. Book box cricket, football grounds, tennis and pickleball courts directly.',
};

async function TurfsDiscoveryContent() {
  const isDemo = process.env.GOTURF_DEMO_ONLY === 'true';
  const initialMode = isDemo ? 'demo' : 'live';
  const turfs = await fetchLiveApprovedTurfs(initialMode);
  return <TurfsDiscoveryClient initialTurfs={turfs} initialMode={initialMode} />;
}

export default function TurfsDiscoveryPage() {
  return (
    <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col justify-between selection:bg-[#ffff94] selection:text-[#03594d] relative overflow-hidden">
      <div className="relative z-10 flex flex-col flex-1">
        <MaggieNavbar />
        <Suspense
          fallback={
            <div className="max-w-6xl w-full mx-auto px-6 py-20 flex-1 flex items-center justify-center font-black text-sm text-[#03594d]">
              Loading live Mumbai arenas from database...
            </div>
          }
        >
          <TurfsDiscoveryContent />
        </Suspense>
        <MaggieFooter />
      </div>
    </main>
  );
}
