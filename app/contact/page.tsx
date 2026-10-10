import Link from 'next/link';

export const metadata = {
  title: 'Contact Us | GoTurf Mumbai',
  description: 'Get in touch with the GoTurf team for support, turf listings, or booking inquiries.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col justify-between selection:bg-[#ffff94] selection:text-[#03594d]">
      <header className="border-b-2 border-[#03594d] px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#82eda6]/90">
        <Link href="/" className="flex items-center gap-2 text-xs font-black text-[#03594d] hover:underline uppercase tracking-wider">
          <span>&larr;</span>
          <span>Back to GoTurf</span>
        </Link>
        <span className="text-xs font-black uppercase tracking-wider bg-[#ffff94] text-[#03594d] px-3 py-1 rounded-full border border-[#03594d] shadow-maggie-sm">
          Contact Us
        </span>
      </header>

      <div className="max-w-3xl w-full mx-auto px-6 py-12 flex-1">
        <div className="bg-white rounded-[32px] border-2 border-[#03594d] shadow-maggie-lg p-8 sm:p-12 text-xs leading-relaxed space-y-8 text-[#03594d]">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black text-[#03594d] tracking-tight uppercase">Contact Us</h1>
            <p className="text-[#03594d]/80 font-bold">We are here to help players and venue partners with any questions or support.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border-2 border-[#03594d] bg-[#f9f8f4] shadow-maggie-sm space-y-2">
              <span className="text-[10px] uppercase font-black text-[#03594d] bg-[#ffff94] px-2 py-0.5 rounded border border-[#03594d] tracking-wider">Customer Support</span>
              <h3 className="text-sm font-black text-[#03594d]">Email Us</h3>
              <p className="text-[#03594d]/80 font-semibold">For booking issues, refunds, and general queries:</p>
              <a href="mailto:support@goturf.in" className="inline-block text-[#03594d] font-black underline text-sm">
                support@goturf.in
              </a>
            </div>

            <div className="p-5 rounded-2xl border-2 border-[#03594d] bg-[#f9f8f4] shadow-maggie-sm space-y-2">
              <span className="text-[10px] uppercase font-black text-[#03594d] bg-[#fdc068] px-2 py-0.5 rounded border border-[#03594d] tracking-wider">Business & Turf Listing</span>
              <h3 className="text-sm font-black text-[#03594d]">Partner Inquiries</h3>
              <p className="text-[#03594d]/80 font-semibold">Want to list your turf or arena on GoTurf?</p>
              <a href="mailto:partners@goturf.in" className="inline-block text-[#03594d] font-black underline text-sm">
                partners@goturf.in
              </a>
            </div>
          </div>

          <section className="space-y-3 p-6 rounded-2xl border-2 border-[#03594d] bg-[#f9f8f4] shadow-maggie-sm">
            <h2 className="text-base font-black text-[#03594d] uppercase">Operating Entity & Address</h2>
            <div className="space-y-1.5 text-[#03594d]/85 text-xs font-semibold">
              <p><strong className="text-[#03594d]">Brand Name:</strong> GoTurf</p>
              <p><strong className="text-[#03594d]">Registered City:</strong> Mumbai, Maharashtra, India</p>
              <p><strong className="text-[#03594d]">Operating Address:</strong> Carter Road, Bandra West, Mumbai 400050, India</p>
              <p><strong className="text-[#03594d]">Operational Hours:</strong> 7:00 AM – 11:30 PM IST (Monday through Sunday)</p>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-[#03594d] uppercase">Response Time</h2>
            <p className="font-semibold text-[#03594d]/85">
              Our support desk operates 7 days a week. For booking cancellation requests and match check-in queries, our average email response time is under 2 hours.
            </p>
          </section>
        </div>
      </div>

      <footer className="border-t-2 border-[#03594d] px-6 py-6 text-center text-xs text-[#03594d]/75 font-bold bg-[#82eda6]">
        GoTurf &bull; Carter Road, Bandra West, Mumbai, India &bull; support@goturf.in
      </footer>
    </main>
  );
}
