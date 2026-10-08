'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPendingTurf } from '@/lib/data/turfs';
import type { SportType } from '@/types/database';

export default function NewTurfWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [locality, setLocality] = useState('Bandra West');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('19.0760');
  const [lng, setLng] = useState('72.8777');
  const [rules, setRules] = useState('Flat turf shoes required. Arrive 10 minutes before slot.');
  const [cancellationRule, setCancellationRule] = useState('Full refund up to 24 hours before match.');
  const [contactNumber, setContactNumber] = useState('');

  // Courts
  const [courtName, setCourtName] = useState('Court 1 - Box Cricket');
  const [courtSport, setCourtSport] = useState<SportType>('cricket');
  const [courtFormat, setCourtFormat] = useState('Box Cricket (8v8)');
  const [slotMinutes, setSlotMinutes] = useState(60);

  // Facilities
  const [facilities, setFacilities] = useState<string[]>([
    'Floodlights',
    'Free Parking',
    'Drinking Water',
  ]);

  const toggleFacility = (item: string) => {
    setFacilities((prev) =>
      prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-demo';

    createPendingTurf({
      name,
      slug,
      owner_id: '20000000-0000-0000-0000-000000000002',
      region_id: '10000000-0000-0000-0000-000000000001',
      address,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      maps_url: `https://maps.google.com/?q=${lat},${lng}`,
      facilities,
      rules,
      cancellation_rule: cancellationRule,
      is_demo: true,
      region: {
        id: '10000000-0000-0000-0000-000000000001',
        locality,
        city: 'Mumbai',
        state: 'Maharashtra',
        created_at: new Date().toISOString(),
      },
      courts: [
        {
          id: `court-${Date.now()}`,
          turf_id: 'pending-turf',
          name: courtName,
          sport: courtSport,
          format: courtFormat,
          surface: 'Artificial Turf',
          slot_minutes: slotMinutes,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setIsDone(true);
    }, 700);
  };

  if (isDone) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-neutral-900/70 border border-neutral-800 text-center shadow-2xl">
          <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-3xl">
            ⏳
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Submitted for Review</h1>
          <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
            Your venue <strong>{name}</strong> has been submitted with status <span className="text-amber-400 font-semibold uppercase">Pending</span>. It is strictly unlisted from the public discovery page until approved by the platform admin.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/admin"
              className="w-full py-3 px-4 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors"
            >
              Open Admin Suite to Review & Approve &rarr;
            </Link>
            <Link
              href="/owner"
              className="w-full py-3 px-4 rounded-xl bg-neutral-800 text-neutral-300 font-medium text-xs hover:bg-neutral-700 transition-colors"
            >
              Back to Owner Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      <header className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between">
        <Link href="/owner" className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white">
          <span>&larr;</span>
          <span>Owner Dashboard</span>
        </Link>
        <span className="text-xs font-semibold text-emerald-400">Step {step} of 3</span>
      </header>

      <div className="max-w-2xl w-full mx-auto px-6 py-10 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Register a New Sports Turf</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Provide venue details, courts, and verification notes for platform approval.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800">
              <h2 className="text-base font-bold text-white mb-2">1. Venue Basics</h2>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Turf Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Carter Road Sports Arena"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Locality in Mumbai</label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Bandra West">Bandra West</option>
                  <option value="Powai">Powai</option>
                  <option value="Andheri East">Andheri East</option>
                  <option value="Juhu">Juhu</option>
                  <option value="Borivali West">Borivali West</option>
                  <option value="South Mumbai">South Mumbai</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Physical Address</label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full landmark and street address..."
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!name || !address}
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 disabled:opacity-50"
                >
                  Next: Setup Courts &rarr;
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800">
              <h2 className="text-base font-bold text-white mb-2">2. Add Initial Court</h2>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Court Name</label>
                <input
                  type="text"
                  required
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  placeholder="e.g. Court 1 - Box Cricket"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Sport</label>
                  <select
                    value={courtSport}
                    onChange={(e) => setCourtSport(e.target.value as SportType)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="cricket">Cricket</option>
                    <option value="football">Football</option>
                    <option value="tennis">Tennis</option>
                    <option value="pickleball">Pickleball</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Slot Duration</label>
                  <select
                    value={slotMinutes}
                    onChange={(e) => setSlotMinutes(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={60}>60 Minutes (Standard)</option>
                    <option value={90}>90 Minutes</option>
                    <option value={30}>30 Minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Court Format</label>
                <input
                  type="text"
                  value={courtFormat}
                  onChange={(e) => setCourtFormat(e.target.value)}
                  placeholder="e.g. 5-a-side, Box Cricket, Doubles"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400"
                >
                  Next: Coordinates & Review &rarr;
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800">
              <h2 className="text-base font-bold text-white mb-2">3. Coordinates & Amenities</h2>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Latitude</label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Longitude</label>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Amenities Available</label>
                <div className="flex flex-wrap gap-2">
                  {['Floodlights', 'Free Parking', 'Changing Rooms', 'Drinking Water', 'Bibs & Match Balls', 'Coaching Available'].map((fac) => (
                    <button
                      key={fac}
                      type="button"
                      onClick={() => toggleFacility(fac)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        facilities.includes(fac)
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-neutral-950 border border-neutral-800 text-neutral-400'
                      }`}
                    >
                      {fac}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Public Verification Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+91 98200 11223"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700"
                >
                  &larr; Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-xs font-extrabold hover:opacity-95 shadow-lg shadow-emerald-500/20"
                >
                  {isSubmitting ? 'Submitting Venue...' : 'Submit for Admin Approval 🚀'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <footer className="border-t border-neutral-800/80 px-6 py-4 text-center text-xs text-neutral-600">
        GoTurf &bull; Owner Onboarding Wizard
      </footer>
    </main>
  );
}
