import Link from 'next/link';

export const metadata = {
  title: 'Cancellation & Refund Policy | GoTurf Mumbai',
  description: 'Cancellation, refund timelines, and delivery policies for sports turf bookings on GoTurf.',
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col justify-between selection:bg-[#ffff94] selection:text-[#03594d]">
      <header className="border-b-2 border-[#03594d] px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#82eda6]/90">
        <Link href="/" className="flex items-center gap-2 text-xs font-black text-[#03594d] hover:underline uppercase tracking-wider">
          <span>&larr;</span>
          <span>Back to GoTurf</span>
        </Link>
        <span className="text-xs font-black uppercase tracking-wider bg-[#ffff94] text-[#03594d] px-3 py-1 rounded-full border border-[#03594d] shadow-maggie-sm">
          Refund Policy
        </span>
      </header>

      <div className="max-w-3xl w-full mx-auto px-6 py-12 flex-1">
        <div className="bg-white rounded-[32px] border-2 border-[#03594d] shadow-maggie-lg p-8 sm:p-12 text-xs leading-relaxed space-y-6 text-[#03594d]">
          <h1 className="text-2xl sm:text-4xl font-black text-[#03594d] tracking-tight uppercase">Cancellation & Refund Policy</h1>
          <p className="text-[#03594d]/80 font-bold">Last updated: October 2026 &bull; GoTurf Mumbai</p>

          <section className="space-y-2">
            <h2 className="text-base font-black text-[#03594d] uppercase">1. Service Delivery & Fulfillment</h2>
            <p className="font-semibold text-[#03594d]/85">
              GoTurf provides digital reservation management for sports arenas and turfs. Upon successful online token or full payment, your booking confirmation and digital <strong>Match Pass with Check-In PIN</strong> is delivered immediately on-screen and transmitted via SMS/WhatsApp/Email. No physical shipment is required.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-[#03594d] uppercase">2. Cancellation Timeline</h2>
            <ul className="list-disc pl-5 space-y-2 font-semibold text-[#03594d]/85">
              <li>
                <strong>More than 24 hours before match kickoff:</strong> You are eligible for a 100% refund of the slot booking reservation fee (excluding payment processing convenience fee).
              </li>
              <li>
                <strong>Within 24 hours of match kickoff:</strong> Turf slots are exclusively reserved and cannot be re-allocated on short notice. Cancellations made within 24 hours are non-refundable.
              </li>
              <li>
                <strong>Venue-initiated cancellation / Adverse Weather:</strong> In cases of unexpected venue maintenance, waterlogging, or severe weather that renders the turf unplayable, players will receive a full 100% refund or free slot reschedule according to player preference.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-[#03594d] uppercase">3. Refund Processing Timeline</h2>
            <p className="font-semibold text-[#03594d]/85">
              Approved refunds are credited directly back to the original source account (UPI, Credit/Debit Card, Net Banking) via our payment gateway partner (Razorpay). 
              Refunds typically reflect in your account within <strong>5 to 7 business days</strong> depending on your bank&apos;s processing cycle.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-[#03594d] uppercase">4. Concurrency Collisions & Automatic Reversals</h2>
            <p className="font-semibold text-[#03594d]/85">
              If two players initiate checkout simultaneously and your payment succeeds after another user finalized the slot, our automated concurrency engine releases an immediate auto-refund request to your source account within 15 minutes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-[#03594d] uppercase">5. Support & Inquiries</h2>
            <p className="font-semibold text-[#03594d]/85">
              For any refund assistance or booking status inquiries, please email our support team at <a href="mailto:support@goturf.in" className="text-[#03594d] font-black underline underline-offset-2">support@goturf.in</a> or visit our <Link href="/contact" className="text-[#03594d] font-black underline underline-offset-2">Contact Page</Link>.
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
