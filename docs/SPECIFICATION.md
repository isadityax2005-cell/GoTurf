# GoTurf Specification & Architecture Rules

## 1. Core Principles
- **Verified only**: Only owner-registered, admin-verified turfs are visible or bookable.
- **Owner-maintained truth**: Availability, prices, and rules come directly from owners. Never guess or scrape.
- **Server decides**: The server, not the browser, decides if a slot is free and if a payment succeeded.
- **Local first, region-ready**: Focused on Mumbai (Cricket, Football, Tennis, Pickleball). Stores city/state on turfs, all times in UTC, displayed in IST (+05:30), currency stored in integer paise.
- **Zero double bookings guarantee**: Concurrency collisions strictly prevented at the database level via PostgreSQL exclusion constraints (`EXCLUDE USING gist`).

---

## 2. Realistic MVP Scope (Section 3)

### Player
- Sign up & log in (Magic link / Google OAuth; no SMS costs). Name and phone collected at booking.
- Area picker (Mumbai localities), turf list with filters: sport, price, date.
- Turf page: Photos, sports, facilities, rules, address with "Open in Google Maps" link, prices, opening hours, live slot grid.
- Booking flow: Slot selection, 10-minute hold with countdown, online payment, confirmation receipt page, booking history, cancellation per owner's refund rules.

### Turf Owner Dashboard
- Registration, ownership verification upload.
- Onboarding wizard: details, location (manual pin / address), owner photos.
- Court setup: opening hours, slot durations (30, 60, 90 mins), peak/off-peak price rules.
- Availability calendar: 2-tap offline block creation (phone bookings, coaching batches, maintenance).
- Bookings list & calendar view, payout/KYC status.

### Admin
- Verification queue (approve/reject with reason).
- Booking search by player, turf, date.
- Cancel-and-refund button connected to payment partner.
- Dispute log for incident resolution.
- Emergency switch to instantly hide/unlist a turf.
- Audit log of every administrative and financial action.

---

## 3. How Availability Actually Works (Section 5)

- **Slot generation**: Calculated on-the-fly from court opening hours and slot duration (not statically pre-generated).
- **Price rules**: Copied directly into each booking when held/confirmed so future price changes do not alter booked slots.
- **Concurrency & Double-Booking Prevention**:
  - Unified `bookings` table storing both player bookings and owner blocks (`booking_type: 'player' | 'owner_block'`).
  - Active statuses (`held`, `confirmed`) participate in PostgreSQL GiST exclusion constraint (`court_id WITH =, time_range WITH &&`).
- **10-Minute Hold Expiry**:
  - Lazy expiration: On every slot query or hold creation, stale holds are automatically marked expired.
  - Background database clock: Supabase `pg_cron` sweeps every 60 seconds to release expired holds.
  - Slot release button available if a player abandons checkout early.
- **Payment Verification**:
  - Initiating is NOT verifying. Client redirects or app return screens prove nothing.
  - Confirmed ONLY upon verified HMAC-signed server-to-server webhook from payment provider.
  - Idempotent webhook handling using provider event IDs.
  - Late payment after expiry: auto-claim if slot is still free, otherwise issue automatic refund.

---

## 4. Beginner-Friendly Build Phases (Section 12)

- **Phase 0: Setup** — GitHub repo, Next.js 16 App Router, TypeScript, Tailwind CSS 4, docs, `.env.example`, git hygiene.
- **Phase 1: Design & Data Model** — Relational schema with PostgreSQL exclusion constraint, unified bookings/blocks, 3 fictional Mumbai demo turfs seed data.
- **Phase 2: Accounts & RBAC** — Auth, profiles, role middleware protection (`player`, `owner`, `admin`), Supabase RLS policies.
- **Phase 3: Turf Listings** — Owner onboarding wizard, photo upload, admin verification queue, player discovery & filters.
- **Phase 4: Slot Management** — Operating hours, slot duration, price rules, owner offline blocks, dynamic slot grid generator.
- **Phase 5: Booking Logic** — 10-minute temporary hold endpoint, countdown UI, race test (50 parallel requests), lazy hold expiry.
- **Phase 6: Payment Integration** — Gateway order creation, client checkout, HMAC webhook verification, idempotency, failure/retry, automated refunds.
- **Phase 7: Notifications & Admin Suite** — Transactional emails, booking search, dispute logging, emergency hide, mobile responsive polish.
- **Phase 8: Acceptance Testing** — Comprehensive test suite validating all 12 acceptance criteria.
- **Phase 9: Production & Pilot** — Production domain, live payment mode, onboarding 1–3 pilot turfs in Mumbai, 4-week pilot scorecard.
