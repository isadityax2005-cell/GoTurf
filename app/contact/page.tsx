import Link from 'next/link';

export const metadata = {
  title: 'Contact Us | GoTurf Mumbai',
  description: 'Get in touch with the GoTurf team for support, turf listings, or booking inquiries.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      <header className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-neutral-950/80">
        <Link href="/" className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors">
          <span>&larr;</span>
          <span>Back to GoTurf</span>
        </Link>
        <span className="text-xs font-bold text-emerald-400">Contact Us</span>
      </header>

      <div className="max-w-3xl w-full mx-auto px-6 py-12 flex-1 text-xs leading-relaxed space-y-8 text-neutral-300">
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white tracking-tight">Contact Us</h1>
          <p className="text-neutral-400">We are here to help players and venue partners with any questions or support.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-2">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Customer Support</span>
            <h3 className="text-sm font-semibold text-white">Email Us</h3>
            <p className="text-neutral-400">For booking issues, refunds, and general queries:</p>
            <a href="mailto:support@goturf.in" className="inline-block text-emerald-400 font-medium hover:underline text-sm">
              support@goturf.in
            </a>
          </div>

          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-2">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Business & Turf Listing</span>
            <h3 className="text-sm font-semibold text-white">Partner Inquiries</h3>
            <p className="text-neutral-400">Want to list your turf or arena on GoTurf?</p>
            <a href="mailto:partners@goturf.in" className="inline-block text-emerald-400 font-medium hover:underline text-sm">
              partners@goturf.in
            </a>
          </div>
        </div>

        <section className="space-y-3 p-5 rounded-xl border border-neutral-800 bg-neutral-900/40">
          <h2 className="text-base font-bold text-white">Operating Entity & Address</h2>
          <div className="space-y-1 text-neutral-400 text-xs">
            <p><strong className="text-white">Brand Name:</strong> GoTurf</p>
            <p><strong className="text-white">Registered City:</strong> Mumbai, Maharashtra, India</p>
            <p><strong className="text-white">Operating Address:</strong> Carter Road, Bandra West, Mumbai 400050, India</p>
            <p><strong className="text-white">Operational Hours:</strong> 7:00 AM – 11:30 PM IST (Monday through Sunday)</p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">Response Time</h2>
          <p>
            Our support desk operates 7 days a week. For booking cancellation requests and match check-in queries, our average email response time is under 2 hours.
          </p>
        </section>
      </div>

      <footer className="border-t border-neutral-800/80 px-6 py-6 text-center text-xs text-neutral-500">
        GoTurf &bull; Carter Road, Bandra West, Mumbai, India &bull; support@goturf.in
      </footer>
    </main>
  );
}
