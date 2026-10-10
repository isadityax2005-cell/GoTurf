'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SportType } from '@/types/database';

export default function NewTurfRegistrationPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [locality, setLocality] = useState('Bandra West');
  const [address, setAddress] = useState('');
  const [courtName, setCourtName] = useState('Main Arena 1');
  const [courtSport, setCourtSport] = useState<SportType>('cricket');
  const [slotMinutes, setSlotMinutes] = useState(60);
  const [courtFormat, setCourtFormat] = useState('Box Cricket');
  const [lat, setLat] = useState('19.0596');
  const [lng, setLng] = useState('72.8295');
  const [facilities, setFacilities] = useState<string[]>(['Floodlights', 'Free Parking', 'Drinking Water']);
  const [contactNumber, setContactNumber] = useState('');

  const toggleFacility = (fac: string) => {
    setFacilities((prev) =>
      prev.includes(fac) ? prev.filter((f) => f !== fac) : [...prev, fac]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock registration API submit
    setTimeout(() => {
      setIsSubmitting(false);
      setIsDone(true);
    }, 900);
  };

  if (isDone) {
    return (
      <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col items-center justify-center px-6 selection:bg-[#ffff94] selection:text-[#03594d]">
        <div className="max-w-md w-full p-8 sm:p-10 rounded-[32px] bg-white border-2 border-[#03594d] text-center shadow-maggie-lg text-[#03594d]">
          <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-[#ffff94] border-2 border-[#03594d] text-[#03594d] flex items-center justify-center text-3xl shadow-maggie-sm">
            ⏳
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#03594d] mb-2">Submitted for Review</h1>
          <p className="text-xs text-[#03594d]/80 font-bold mb-6 leading-relaxed">
            Your venue <strong>{name}</strong> has been submitted with status <span className="bg-[#ffff94] px-2 py-0.5 rounded border border-[#03594d] font-black uppercase">Pending</span>. It is strictly unlisted from the public discovery page until approved by the platform admin.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/admin"
              className="w-full py-3.5 px-4 rounded-full bg-[#03594d] text-[#82eda6] font-black uppercase text-xs tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] transition-all"
            >
              Open Admin Suite to Review & Approve &rarr;
            </Link>
            <Link
              href="/owner"
              className="w-full py-3.5 px-4 rounded-full bg-white hover:bg-[#ffff94] text-[#03594d] font-black uppercase text-xs tracking-wider border-2 border-[#03594d] shadow-maggie-sm transition-all"
            >
              Back to Owner Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col justify-between selection:bg-[#ffff94] selection:text-[#03594d]">
      <header className="border-b-2 border-[#03594d] px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#82eda6]/90 text-[#03594d]">
        <Link href="/owner" className="flex items-center gap-2 text-xs font-black text-[#03594d] hover:underline uppercase tracking-wider">
          <span>&larr;</span>
          <span>Owner Dashboard</span>
        </Link>
        <span className="text-xs font-black uppercase tracking-wider bg-[#ffff94] text-[#03594d] px-3 py-1 rounded-full border border-[#03594d] shadow-maggie-sm">
          Step {step} of 3
        </span>
      </header>

      <div className="max-w-2xl w-full mx-auto px-6 py-10 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-black text-[#03594d] uppercase tracking-tight">Register a New Sports Turf</h1>
          <p className="text-xs text-[#03594d]/80 font-bold mt-1">
            Provide venue details, courts, and verification notes for platform approval.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 p-6 sm:p-8 rounded-[32px] bg-white border-2 border-[#03594d] shadow-maggie text-[#03594d]">
              <h2 className="text-base font-black uppercase text-[#03594d] mb-2">1. Venue Basics</h2>
              <div>
                <label className="block text-xs font-black uppercase mb-1.5">Turf Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Carter Road Sports Arena"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1.5">Locality in Mumbai</label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:bg-white focus:outline-none"
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
                <label className="block text-xs font-black uppercase mb-1.5">Physical Address</label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full landmark and street address..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!name || !address}
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] disabled:opacity-50"
                >
                  Next: Setup Courts &rarr;
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 p-6 sm:p-8 rounded-[32px] bg-white border-2 border-[#03594d] shadow-maggie text-[#03594d]">
              <h2 className="text-base font-black uppercase text-[#03594d] mb-2">2. Add Initial Court</h2>
              <div>
                <label className="block text-xs font-black uppercase mb-1.5">Court Name</label>
                <input
                  type="text"
                  required
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  placeholder="e.g. Court 1 - Box Cricket"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase mb-1.5">Sport</label>
                  <select
                    value={courtSport}
                    onChange={(e) => setCourtSport(e.target.value as SportType)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:bg-white focus:outline-none"
                  >
                    <option value="cricket">Cricket</option>
                    <option value="football">Football</option>
                    <option value="tennis">Tennis</option>
                    <option value="pickleball">Pickleball</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-1.5">Slot Duration</label>
                  <select
                    value={slotMinutes}
                    onChange={(e) => setSlotMinutes(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:bg-white focus:outline-none"
                  >
                    <option value={60}>60 Minutes (Standard)</option>
                    <option value={90}>90 Minutes</option>
                    <option value={30}>30 Minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1.5">Court Format</label>
                <input
                  type="text"
                  value={courtFormat}
                  onChange={(e) => setCourtFormat(e.target.value)}
                  placeholder="e.g. 5-a-side, Box Cricket, Doubles"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2 rounded-full bg-white border-2 border-[#03594d] text-[#03594d] text-xs font-black uppercase shadow-maggie-sm hover:bg-[#ffff94]"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c]"
                >
                  Next: Coordinates & Review &rarr;
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 p-6 sm:p-8 rounded-[32px] bg-white border-2 border-[#03594d] shadow-maggie text-[#03594d]">
              <h2 className="text-base font-black uppercase text-[#03594d] mb-2">3. Coordinates & Amenities</h2>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase mb-1.5">Latitude</label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase mb-1.5">Longitude</label>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1.5">Amenities Available</label>
                <div className="flex flex-wrap gap-2">
                  {['Floodlights', 'Free Parking', 'Changing Rooms', 'Drinking Water', 'Bibs & Match Balls', 'Coaching Available'].map((fac) => (
                    <button
                      key={fac}
                      type="button"
                      onClick={() => toggleFacility(fac)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all border-2 border-[#03594d] ${
                        facilities.includes(fac)
                          ? 'bg-[#ffff94] text-[#03594d] shadow-maggie-sm'
                          : 'bg-[#f9f8f4] text-[#03594d]/70'
                      }`}
                    >
                      {fac}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1.5">Public Verification Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+91 98200 11223"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2 rounded-full bg-white border-2 border-[#03594d] text-[#03594d] text-xs font-black uppercase shadow-maggie-sm hover:bg-[#ffff94]"
                >
                  &larr; Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting Venue...' : 'Submit for Admin Approval 🚀'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <footer className="border-t-2 border-[#03594d] px-6 py-4 text-center text-xs text-[#03594d]/75 font-bold bg-[#82eda6]">
        GoTurf &bull; Owner Onboarding Wizard
      </footer>
    </main>
  );
}
