import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | GoTurf Mumbai',
  description: 'Terms and conditions for booking sports turfs and arenas via GoTurf.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      <header className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-neutral-950/80">
        <Link href="/" className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white">
          <span>&larr;</span>
          <span>Back to GoTurf</span>
        </Link>
        <span className="text-xs font-bold text-emerald-400">Terms of Service</span>
      </header>

      <div className="max-w-3xl w-full mx-auto px-6 py-12 flex-1 text-xs leading-relaxed space-y-6 text-neutral-300">
        <h1 className="text-2xl font-black text-white tracking-tight">Terms and Conditions</h1>
        <p className="text-neutral-400">Last updated: October 2026 &bull; GoTurf Mumbai</p>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Platform Services</h2>
          <p>
            GoTurf provides an online sports venue discovery and slot booking platform connecting sports players with turf and court owners across Mumbai. By reserving a slot through GoTurf, you agree to comply with venue ground rules and these terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Slot Reservations & Holds</h2>
          <p>
            When initiating a checkout, GoTurf provides a temporary 10-minute hold to prevent concurrency collisions. The slot is permanently confirmed once online payment (token advance or full prepayment) is verified by our payment gateway.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Pricing & Convenience Fee</h2>
          <p>
            All court slot prices are displayed in Indian Rupees (INR) and determined directly by venue owners. A verified platform convenience fee of ₹45 (including applicable 18% GST) is applied to online bookings to cover database locking infrastructure, instant UPI processing, and automated refund management.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Venue Conduct & Safety</h2>
          <p>
            Players must adhere to venue footwear guidelines (flat turf shoes or molded studs; no metal spikes). GoTurf is a booking aggregator; sports injuries, personal belongings, or venue facilities are the operational responsibility of the venue management and attending players.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">5. Governing Law</h2>
          <p>
            These terms are governed by the laws of India, with jurisdiction in Mumbai, Maharashtra.
          </p>
        </section>
      </div>

      <footer className="border-t border-neutral-800/80 px-6 py-6 text-center text-xs text-neutral-500">
        GoTurf &bull; Carter Road, Bandra West, Mumbai, India &bull; support@goturf.in
      </footer>
    </main>
  );
}
