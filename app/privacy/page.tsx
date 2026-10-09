import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | GoTurf Mumbai',
  description: 'Privacy policy and data protection guidelines for GoTurf players and partners.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      <header className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-neutral-950/80">
        <Link href="/" className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white">
          <span>&larr;</span>
          <span>Back to GoTurf</span>
        </Link>
        <span className="text-xs font-bold text-emerald-400">Privacy Policy</span>
      </header>

      <div className="max-w-3xl w-full mx-auto px-6 py-12 flex-1 text-xs leading-relaxed space-y-6 text-neutral-300">
        <h1 className="text-2xl font-black text-white tracking-tight">Privacy Policy</h1>
        <p className="text-neutral-400">Last updated: October 2026 &bull; GoTurf Mumbai</p>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
          <p>
            When reserving a turf on GoTurf, we collect player contact details including Full Name, WhatsApp Mobile Number, and Email Address. This data is strictly used to deliver digital Match Passes, booking confirmations, and customer support.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Payment Security</h2>
          <p>
            GoTurf does not store, process, or view credit/debit card numbers or UPI MPINs. All payments are processed directly through RBI-authorized payment aggregators (Razorpay) utilizing bank-grade TLS encryption and signed webhook verification.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Data Sharing</h2>
          <p>
            Your name, phone number, and Match Check-In PIN are shared solely with the operating manager of the booked sports venue to verify your squad upon gate arrival. We never sell, rent, or trade player data to third-party marketers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Your Rights</h2>
          <p>
            Players may request access, correction, or deletion of their account profile data at any time by contacting our privacy team at privacy@goturf.in.
          </p>
        </section>
      </div>

      <footer className="border-t border-neutral-800/80 px-6 py-6 text-center text-xs text-neutral-500">
        GoTurf &bull; Carter Road, Bandra West, Mumbai, India &bull; privacy@goturf.in
      </footer>
    </main>
  );
}
