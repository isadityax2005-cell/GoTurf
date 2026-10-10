import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | GoTurf Mumbai',
  description: 'Privacy policy and data protection guidelines for GoTurf players and partners.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col justify-between selection:bg-[#ffff94] selection:text-[#03594d]">
      <header className="border-b-2 border-[#03594d] px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#82eda6]/90">
        <Link href="/" className="flex items-center gap-2 text-xs font-black text-[#03594d] hover:underline uppercase tracking-wider">
          <span>&larr;</span>
          <span>Back to GoTurf</span>
        </Link>
        <span className="text-xs font-black uppercase tracking-wider bg-[#ffff94] text-[#03594d] px-3 py-1 rounded-full border border-[#03594d] shadow-maggie-sm">
          Privacy Policy
        </span>
      </header>

      <div className="max-w-3xl w-full mx-auto px-6 py-12 flex-1">
        <div className="bg-white rounded-[32px] border-2 border-[#03594d] shadow-maggie-lg p-8 sm:p-12 text-xs leading-relaxed space-y-6 text-[#03594d]">
          <h1 className="text-2xl sm:text-4xl font-black text-[#03594d] tracking-tight uppercase">Privacy Policy</h1>
          <p className="text-[#03594d]/80 font-bold">Last updated: October 2026 &bull; GoTurf Mumbai</p>

          <section className="space-y-2">
            <h2 className="text-base font-black text-[#03594d] uppercase">1. Information We Collect</h2>
            <p className="font-semibold text-[#03594d]/85">
              When reserving a turf on GoTurf, we collect player contact details including Full Name, WhatsApp Mobile Number, and Email Address. This data is strictly used to deliver digital Match Passes, booking confirmations, and customer support.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-[#03594d] uppercase">2. Payment Security</h2>
            <p className="font-semibold text-[#03594d]/85">
              GoTurf does not store, process, or view credit/debit card numbers or UPI MPINs. All payments are processed directly through RBI-authorized payment aggregators (Razorpay) utilizing bank-grade TLS encryption and signed webhook verification.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-[#03594d] uppercase">3. Data Sharing</h2>
            <p className="font-semibold text-[#03594d]/85">
              Your name, phone number, and Match Check-In PIN are shared solely with the operating manager of the booked sports venue to verify your squad upon gate arrival. We never sell, rent, or trade player data to third-party marketers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-[#03594d] uppercase">4. Your Rights</h2>
            <p className="font-semibold text-[#03594d]/85">
              Players may request access, correction, or deletion of their account profile data at any time by contacting our privacy team at privacy@goturf.in.
            </p>
          </section>
        </div>
      </div>

      <footer className="border-t-2 border-[#03594d] px-6 py-6 text-center text-xs text-[#03594d]/75 font-bold bg-[#82eda6]">
        GoTurf &bull; Carter Road, Bandra West, Mumbai, India &bull; privacy@goturf.in
      </footer>
    </main>
  );
}
