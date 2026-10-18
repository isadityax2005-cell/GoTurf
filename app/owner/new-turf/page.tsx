'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { SportType } from '@/types/database';

export default function NewTurfRegistrationPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
  const [submittedTurf, setSubmittedTurf] = useState<{ id: string; name: string; slug: string; status: string; owner_id: string } | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser({ id: user.id, email: user.email });
        }
      } catch (err) {
        console.warn('Could not read user in new-turf page:', err);
      }
    }
    checkAuth();
  }, []);

  // Form State
  const [name, setName] = useState('');
  const [locality, setLocality] = useState('Bandra West');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  
  // Court Details
  const [courtName, setCourtName] = useState('Court 1 - Main Arena');
  const [courtSport, setCourtSport] = useState<SportType>('cricket');
  const [slotMinutes, setSlotMinutes] = useState(60);
  const [courtFormat, setCourtFormat] = useState('Box Cricket');

  // Amenities & Photos
  const [facilities, setFacilities] = useState<string[]>([
    'Floodlights',
    'Free Parking',
    'Drinking Water',
    'Changing Rooms',
  ]);
  const [lat, setLat] = useState('19.0596');
  const [lng, setLng] = useState('72.8295');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const toggleFacility = (fac: string) => {
    setFacilities((prev) =>
      prev.includes(fac) ? prev.filter((f) => f !== fac) : [...prev, fac]
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    setNotification(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 8 * 1024 * 1024) {
          setNotification(`⚠️ "${file.name}" exceeds 8MB limit.`);
          continue;
        }

        const formData = new FormData();
        formData.append('photo', file);

        const res = await fetch('/api/owner/upload-photo', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.url) {
          setPhotoUrls((prev) => [...prev, data.url]);
        } else {
          setNotification(`⚠️ Failed to upload ${file.name}: ${data.error || 'Server error'}`);
        }
      }
    } catch (err) {
      setNotification('Network error while uploading photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotoUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    try {
      const res = await fetch('/api/owner/submit-turf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          locality,
          address,
          contactNumber,
          courtName,
          courtSport,
          slotMinutes,
          courtFormat,
          facilities,
          lat,
          lng,
          photos: photoUrls,
          ownerId: currentUser?.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedTurf(data.turf);
        setIsDone(true);
      } else {
        setNotification(`⚠️ ${data.error || 'Failed to submit turf registration'}`);
      }
    } catch {
      setNotification('Network error submitting turf. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col items-center justify-center px-4 sm:px-6 py-12 selection:bg-[#ffff94] selection:text-[#03594d]">
        <div className="max-w-lg w-full p-8 sm:p-10 rounded-[32px] bg-white border-2 border-[#03594d] text-center shadow-maggie-lg text-[#03594d]">
          <div className="h-16 w-16 mx-auto mb-5 rounded-2xl bg-[#ffff94] border-2 border-[#03594d] text-[#03594d] flex items-center justify-center text-3xl shadow-maggie-sm">
            🏟️
          </div>
          <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-[#82eda6] text-[#03594d] px-3 py-1 rounded-full border border-[#03594d] mb-3">
            Stored in Supabase
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#03594d] mb-2">
            Submitted for Verification!
          </h1>
          <p className="text-xs text-[#03594d]/80 font-bold mb-4 leading-relaxed">
            Your venue <strong>{name}</strong> and {photoUrls.length} uploaded photo{photoUrls.length === 1 ? '' : 's'} have been safely recorded in Supabase with status <span className="bg-[#ffff94] px-2 py-0.5 rounded border border-[#03594d] font-black uppercase">Pending</span>. It is now queued in the Admin Suite for verification before going live.
          </p>

          {/* Database Confirmation Card */}
          <div className="p-4 rounded-2xl bg-[#f9f8f4] border border-[#03594d]/20 text-left text-xs mb-6 space-y-1.5 font-bold">
            <div className="flex justify-between">
              <span className="text-[#03594d]/70">Venue Name:</span>
              <span className="text-[#03594d] font-black">{submittedTurf?.name || name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#03594d]/70">Locality:</span>
              <span>{locality}, Mumbai</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#03594d]/70">Status:</span>
              <span className="bg-[#ffff94] px-2 py-0.5 rounded border border-[#03594d] text-[10px] font-black uppercase">
                {submittedTurf?.status || 'pending'}
              </span>
            </div>
            {submittedTurf?.owner_id && (
              <div className="flex justify-between">
                <span className="text-[#03594d]/70">Linked Owner ID:</span>
                <span className="font-mono text-[10px] truncate max-w-[180px]">{submittedTurf.owner_id}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/admin"
              className="w-full py-3.5 px-4 rounded-full bg-[#03594d] text-[#82eda6] font-black uppercase text-xs tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] transition-all text-center"
            >
              ⚡ Review & Approve in Admin Suite &rarr;
            </Link>
            <Link
              href="/owner"
              className="w-full py-3.5 px-4 rounded-full bg-white hover:bg-[#ffff94] text-[#03594d] font-black uppercase text-xs tracking-wider border-2 border-[#03594d] shadow-maggie-sm transition-all text-center"
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
      {/* Header */}
      <header className="border-b-2 border-[#03594d] px-4 sm:px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#82eda6]/90 text-[#03594d]">
        <Link
          href="/owner"
          className="flex items-center gap-2 text-xs font-black text-[#03594d] hover:underline uppercase tracking-wider"
        >
          <span>&larr;</span>
          <span>Owner Dashboard</span>
        </Link>
        <span className="text-xs font-black uppercase tracking-wider bg-[#ffff94] text-[#03594d] px-3 py-1 rounded-full border border-[#03594d] shadow-maggie-sm">
          Step {step} of 3
        </span>
      </header>

      {/* Main Container */}
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1">
        <div className="mb-6">
          <span className="inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-[#ffff94] border-2 border-[#03594d] rounded-full shadow-maggie-sm mb-2">
            Owner Onboarding Wizard
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-[#03594d] uppercase tracking-tight">
            Register a New Sports Turf
          </h1>
          <p className="text-xs text-[#03594d]/80 font-bold mt-1">
            Provide venue details, upload authentic turf photos, and submit for platform verification.
          </p>
        </div>

        {notification && (
          <div className="mb-6 p-4 rounded-2xl bg-[#ffff94] border-2 border-[#03594d] text-xs font-bold text-[#03594d] flex justify-between items-center shadow-maggie animate-in fade-in">
            <span>{notification}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-[#03594d] hover:text-black font-black text-sm ml-4 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Venue Basics */}
          {step === 1 && (
            <div className="space-y-4 p-6 sm:p-8 rounded-[32px] bg-white border-2 border-[#03594d] shadow-maggie text-[#03594d]">
              <div className="flex items-center justify-between pb-2 border-b-2 border-[#03594d]/10">
                <h2 className="text-base font-black uppercase text-[#03594d]">1. Venue Basics</h2>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-[#ffff94] border border-[#03594d] rounded-full">
                  Location & Contact
                </span>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1.5">Turf Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bandra Sky Arena"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase mb-1.5">Locality in Mumbai *</label>
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
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-1.5">Verification Phone *</label>
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g. +91 98200 11223"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1.5">Full Physical Address *</label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, nearest landmark, pincode..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  disabled={!name.trim() || !address.trim() || !contactNumber.trim()}
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] disabled:opacity-40 transition-all cursor-pointer"
                >
                  Next: Courts & Formats &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Courts & Sports */}
          {step === 2 && (
            <div className="space-y-4 p-6 sm:p-8 rounded-[32px] bg-white border-2 border-[#03594d] shadow-maggie text-[#03594d]">
              <div className="flex items-center justify-between pb-2 border-b-2 border-[#03594d]/10">
                <h2 className="text-base font-black uppercase text-[#03594d]">2. Setup First Court</h2>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-[#ffff94] border border-[#03594d] rounded-full">
                  Bookable Unit
                </span>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1.5">Court Name *</label>
                <input
                  type="text"
                  required
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  placeholder="e.g. Court 1 - Main Turf"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase mb-1.5">Sport Type *</label>
                  <select
                    value={courtSport}
                    onChange={(e) => setCourtSport(e.target.value as SportType)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:bg-white focus:outline-none"
                  >
                    <option value="cricket">🏏 Box Cricket</option>
                    <option value="football">⚽ 5-a-side Football</option>
                    <option value="pickleball">🏓 Pickleball</option>
                    <option value="tennis">🎾 Tennis</option>
                    <option value="badminton">🏸 Badminton</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-1.5">Standard Slot Duration</label>
                  <select
                    value={slotMinutes}
                    onChange={(e) => setSlotMinutes(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:bg-white focus:outline-none"
                  >
                    <option value={60}>60 Minutes (Standard)</option>
                    <option value={90}>90 Minutes</option>
                    <option value={30}>30 Minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1.5">Court Format / Details</label>
                <input
                  type="text"
                  value={courtFormat}
                  onChange={(e) => setCourtFormat(e.target.value)}
                  placeholder="e.g. 5-a-side Artificial Turf with safety netting"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2 rounded-full bg-white border-2 border-[#03594d] text-[#03594d] text-xs font-black uppercase shadow-maggie-sm hover:bg-[#ffff94] transition-all cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  disabled={!courtName.trim()}
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] disabled:opacity-40 transition-all cursor-pointer"
                >
                  Next: Photos & Amenities &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Photos, Amenities & Final Submission */}
          {step === 3 && (
            <div className="space-y-5 p-6 sm:p-8 rounded-[32px] bg-white border-2 border-[#03594d] shadow-maggie text-[#03594d]">
              <div className="flex items-center justify-between pb-2 border-b-2 border-[#03594d]/10">
                <h2 className="text-base font-black uppercase text-[#03594d]">3. Photos & Amenities</h2>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-[#82eda6] border border-[#03594d] rounded-full">
                  Supabase Storage
                </span>
              </div>

              {/* Photo Upload Box */}
              <div>
                <label className="block text-xs font-black uppercase mb-1.5">
                  Venue Photos (Upload to Supabase Storage)
                </label>
                <div className="p-4 rounded-2xl border-2 border-dashed border-[#03594d] bg-[#f9f8f4] text-center hover:bg-[#ffff94]/20 transition-all">
                  <div className="text-2xl mb-1">📸</div>
                  <p className="text-xs font-bold text-[#03594d] mb-1">
                    Upload turf photos, ground lighting, or facilities
                  </p>
                  <p className="text-[10px] text-[#03594d]/70 mb-3">PNG, JPG, or WEBP up to 8MB each</p>

                  <label className="inline-block px-4 py-2 rounded-full bg-[#ffff94] hover:bg-white text-[#03594d] border-2 border-[#03594d] text-xs font-black shadow-maggie-sm transition-all cursor-pointer">
                    {isUploadingPhoto ? 'Uploading to Supabase...' : '+ Select Photos'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      multiple
                      onChange={handlePhotoUpload}
                      disabled={isUploadingPhoto}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Uploaded Photos Preview List */}
                {photoUrls.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[11px] font-black uppercase text-[#03594d] mb-2">
                      Uploaded Photos ({photoUrls.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {photoUrls.map((url, idx) => (
                        <div
                          key={url}
                          className="relative rounded-2xl border-2 border-[#03594d] overflow-hidden group shadow-maggie-sm aspect-video bg-[#03594d]/5"
                        >
                          <img
                            src={url}
                            alt={`Venue preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-red-500 text-white font-black text-xs flex items-center justify-center border border-[#03594d] shadow-sm hover:scale-110 transition-transform cursor-pointer"
                            title="Remove Photo"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-xs font-black uppercase mb-1.5">Amenities Available</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Floodlights',
                    'Free Parking',
                    'Changing Rooms',
                    'Drinking Water',
                    'Bibs & Match Balls',
                    'Coaching Available',
                    'Air Conditioned Lounge',
                    'First Aid Station',
                  ].map((fac) => (
                    <button
                      key={fac}
                      type="button"
                      onClick={() => toggleFacility(fac)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all border-2 border-[#03594d] cursor-pointer ${
                        facilities.includes(fac)
                          ? 'bg-[#ffff94] text-[#03594d] shadow-maggie-sm'
                          : 'bg-[#f9f8f4] text-[#03594d]/70 hover:bg-white'
                      }`}
                    >
                      {facilities.includes(fac) ? '✓ ' : '+ '}
                      {fac}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2 rounded-full bg-white border-2 border-[#03594d] text-[#03594d] text-xs font-black uppercase shadow-maggie-sm hover:bg-[#ffff94] transition-all cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingPhoto}
                  className="px-7 py-3 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Recording in Supabase...' : 'Submit for Admin Approval 🚀'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-[#03594d] px-6 py-4 text-center text-xs text-[#03594d]/75 font-bold bg-[#82eda6]">
        GoTurf &bull; Owner Onboarding Wizard &bull; Supabase Storage Powered
      </footer>
    </main>
  );
}
