// ============================================================================
// GoTurf browser E2E verification (desktop 1440x900 + mobile 390x844)
//
// Starts `next dev` in isolated DEMO mode with the test payment simulator
// enabled (development only), then drives real Chrome through:
//   venue directory, venue galleries (+ forced image-failure fallback),
//   missing/invalid hold recovery, slot -> hold -> release -> retry -> simulated
//   payment -> confirmation, and the sample bookings page.
// No real payment is possible: demo mode never calls a payment provider and the
// run records every browser request host to prove no live Supabase traffic.
//
// Usage:
//   node scripts/verify-browser-e2e.mjs
// Optional env:
//   PLAYWRIGHT_CORE_PATH  directory containing the playwright-core package
//                         (default: discovered in ~/.npm/_npx/*/node_modules)
//   E2E_PORT              default 3128
//   E2E_EVIDENCE_PATH     default test-evidence/browser-e2e.json (redacted)
//   E2E_SCREENSHOT_DIR    if set, saves viewport screenshots there
// ============================================================================

import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.E2E_PORT || 3128);
const BASE_URL = `http://localhost:${PORT}`;
const EVIDENCE_PATH = path.resolve(ROOT, process.env.E2E_EVIDENCE_PATH || 'test-evidence/browser-e2e.json');
const SHOT_DIR = process.env.E2E_SCREENSHOT_DIR || '';

function loadPlaywright() {
  const candidates = [];
  if (process.env.PLAYWRIGHT_CORE_PATH) candidates.push(process.env.PLAYWRIGHT_CORE_PATH);
  candidates.push(ROOT);
  const npxRoot = path.join(os.homedir(), '.npm', '_npx');
  if (fs.existsSync(npxRoot)) {
    for (const d of fs.readdirSync(npxRoot)) candidates.push(path.join(npxRoot, d, 'node_modules'));
  }
  for (const dir of candidates) {
    try {
      const req = createRequire(path.join(dir, 'noop.js'));
      return req('playwright-core');
    } catch {
      // try next
    }
  }
  throw new Error('playwright-core not found. Set PLAYWRIGHT_CORE_PATH to a directory containing node_modules/playwright-core.');
}
const { chromium } = loadPlaywright();

const VENUES = [
  { slug: 'bandra-turf-arena-demo', name: 'Bandra Turf Arena [Demo]', minThumbs: 6, releaseRetry: true },
  { slug: 'kurla-cage-arena-demo', name: 'Kurla Cage Arena [Demo]', minThumbs: 2 },
  { slug: 'juhu-sunrise-padel-demo', name: 'Juhu Sunrise Padel [Demo]', minThumbs: 2 },
];

const failures = [];
function check(cond, msg) {
  if (!cond) failures.push(msg);
  return Boolean(cond);
}

function redactToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return '[UNRECOGNISED_TOKEN_FORMAT]';
  return `${parts[0]}.[REDACTED_PAYLOAD].[REDACTED_SIG]`;
}

function killGroup(child) {
  if (!child?.pid) return;
  try {
    process.kill(-child.pid, 'SIGKILL');
  } catch {
    try { child.kill('SIGKILL'); } catch { /* ignore */ }
  }
}

function freePort() {
  try {
    execSync(`lsof -ti tcp:${PORT} | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore' });
  } catch { /* ignore */ }
}

async function startServer() {
  freePort();
  let output = '';
  const child = spawn(path.join(ROOT, 'node_modules/.bin/next'), ['dev', '-p', String(PORT)], {
    cwd: ROOT,
    detached: true,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      NEXT_PUBLIC_DEMO_MODE: 'true',
      GOTURF_ENABLE_TEST_PAYMENT_SIMULATOR: 'true',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (c) => { output += c.toString(); });
  child.stderr.on('data', (c) => { output += c.toString(); });
  const started = Date.now();
  while (Date.now() - started < 60000) {
    try {
      const res = await fetch(`${BASE_URL}/api/turfs`);
      if (res.ok) return child;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 400));
  }
  killGroup(child);
  throw new Error(`dev server did not start within 60s. Output tail:\n${output.slice(-800)}`);
}

// Scroll every image into view after hydration settles, then wait for decode.
async function settleImages(page) {
  await page.waitForTimeout(250);
  await page.evaluate(async () => {
    for (const img of Array.from(document.querySelectorAll('img'))) {
      img.scrollIntoView({ block: 'center' });
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
    await Promise.all(
      Array.from(document.querySelectorAll('img')).map((img) =>
        img.complete ? Promise.resolve() : new Promise((r) => { img.onload = img.onerror = () => r(); })
      )
    );
  });
  await page.waitForTimeout(250);
}

async function inspect(page) {
  return page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img')).map((img) => ({
      alt: img.alt,
      loaded: img.complete && img.naturalWidth > 0,
      size: `${img.naturalWidth}x${img.naturalHeight}`,
    }));
    return {
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      totalImages: imgs.length,
      brokenImages: imgs.filter((i) => !i.loaded).map((i) => i.alt),
    };
  });
}

async function bookThroughConfirmation(page, venue, slotIndex, { releaseRetry }) {
  const out = { slug: venue.slug };
  await page.goto(`${BASE_URL}/turfs/${venue.slug}/book`, { waitUntil: 'load' });
  const free = page.locator('button:has-text("Free")');
  await free.first().waitFor({ state: 'visible', timeout: 20000 });
  check(await free.count() > slotIndex, `${venue.slug}: not enough free slots for index ${slotIndex}`);

  const pickAndProceed = async () => {
    const btn = page.locator('button:has-text("Free")').nth(slotIndex);
    const label = ((await btn.textContent()) || '').replace(/\s+/g, ' ').trim();
    await btn.click();
    const proceed = page.locator('button:has-text("Proceed to Book")');
    await proceed.waitFor({ state: 'visible', timeout: 10000 });
    await Promise.all([page.waitForURL(/\/checkout\?/, { timeout: 20000 }), proceed.click()]);
    return label;
  };

  out.slotLabel = await pickAndProceed();
  const holdId = new URL(page.url()).searchParams.get('holdId');
  out.holdTokenRedacted = redactToken(holdId);
  check(holdId?.startsWith('gt_bk.'), `${venue.slug}: hold id is not a signed gt_bk token`);

  const banner = page.locator('[data-testid="simulated-checkout-banner"]');
  await banner.waitFor({ state: 'visible', timeout: 15000 });
  out.bannerText = ((await banner.textContent()) || '').replace(/\s+/g, ' ').trim();
  check(out.bannerText.includes('Simulated checkout, no real payment'), `${venue.slug}: simulated banner text missing`);

  if (releaseRetry) {
    await page.locator('button:has-text("Release Slot")').click();
    await page.waitForURL(/\/book/, { timeout: 15000 });
    await page.locator('button:has-text("Free")').first().waitFor({ state: 'visible', timeout: 20000 });
    out.releasedThenRetried = true;
    out.retrySlotLabel = await pickAndProceed();
    check(out.retrySlotLabel === out.slotLabel, `${venue.slug}: released slot was not free again for retry`);
    await banner.waitFor({ state: 'visible', timeout: 15000 });
  }

  const pay = page.locator('button:has-text("Simulate Payment")');
  await pay.waitFor({ state: 'visible', timeout: 15000 });
  out.payButton = ((await pay.textContent()) || '').replace(/\s+/g, ' ').trim();
  out.checkoutLayout = await inspect(page);
  await pay.click();

  const confirmed = page.locator('[data-testid="booking-confirmed-card"]');
  await confirmed.waitFor({ state: 'visible', timeout: 20000 });
  const pin = ((await page.locator('[data-testid="match-pin-code"]').textContent()) || '').trim();
  out.confirmed = true;
  out.pinFormatValid = /^\d{4}$/.test(pin);
  check(out.pinFormatValid, `${venue.slug}: match PIN invalid`);
  out.confirmedLayout = await inspect(page);
  await settleImages(page);
  out.confirmedLayout = await inspect(page);
  return out;
}

async function runViewport(browser, vp) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const httpErrors = [];
  const hosts = new Set();
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(`[${new URL(page.url()).pathname}] ${m.text().slice(0, 160)} @${m.location().url ? new URL(m.location().url).pathname : ''}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) httpErrors.push(`${r.status()} ${new URL(r.url()).pathname} (from ${new URL(page.url()).pathname})`);
  });
  page.on('pageerror', (e) => pageErrors.push(String(e.message).slice(0, 240)));
  page.on('request', (r) => { try { hosts.add(new URL(r.url()).host); } catch { /* ignore */ } });

  const res = { viewport: vp.label };

  // 1. Directory: every demo venue card present, images load, no overflow
  await page.goto(`${BASE_URL}/turfs`, { waitUntil: 'load' });
  await page.locator('img').first().waitFor({ state: 'visible', timeout: 20000 });
  await settleImages(page);
  const dir = await inspect(page);
  const cards = {};
  for (const v of VENUES) cards[v.slug] = (await page.locator(`a[href="/turfs/${v.slug}"]`).count()) > 0;
  cards['powai-smash-club-demo'] = (await page.locator('a[href="/turfs/powai-smash-club-demo"]').count()) > 0;
  cards['andheri-multi-sport-hub-demo'] = (await page.locator('a[href="/turfs/andheri-multi-sport-hub-demo"]').count()) > 0;
  const andheriStockLabel = (await page.locator('text=Stock photo, illustrative').count()) > 0;
  res.directory = { ...dir, cards, andheriStockLabel };
  check(dir.brokenImages.length === 0, `${vp.label} /turfs broken images: ${dir.brokenImages.join(', ')}`);
  check(!dir.overflow, `${vp.label} /turfs horizontal overflow`);
  check(Object.values(cards).every(Boolean), `${vp.label} /turfs missing venue cards: ${JSON.stringify(cards)}`);
  check(andheriStockLabel, `${vp.label} Andheri stock label missing`);
  if (SHOT_DIR) await page.screenshot({ path: path.join(SHOT_DIR, `${vp.label}-turfs.png`), fullPage: true });

  // 2. Venue detail galleries
  res.galleries = {};
  for (const v of VENUES) {
    await page.goto(`${BASE_URL}/turfs/${v.slug}`, { waitUntil: 'load' });
    await page.locator('img').first().waitFor({ state: 'visible', timeout: 20000 });
    await settleImages(page);
    const info = await inspect(page);
    const thumbs = await page.locator('img[alt*="thumbnail"]').count();
    const label = (await page.locator('text=/Illustrative|Fictional|AI-generated/i').count()) > 0;
    // click through every thumbnail and confirm the hero image decodes
    const heroChecks = [];
    for (let i = 0; i < thumbs; i++) {
      await page.locator('img[alt*="thumbnail"]').nth(i).click();
      await page.waitForTimeout(250);
      heroChecks.push(
        await page.evaluate(() => {
          const hero = document.querySelector('img[alt*="illustrative"], img[alt*="venue photo"]');
          return Boolean(hero && hero.complete && hero.naturalWidth > 0);
        })
      );
    }
    res.galleries[v.slug] = { ...info, thumbnails: thumbs, labelled: label, heroLoadedPerThumb: heroChecks };
    check(thumbs >= v.minThumbs, `${vp.label} ${v.slug}: expected >=${v.minThumbs} thumbnails, got ${thumbs}`);
    check(info.brokenImages.length === 0, `${vp.label} ${v.slug}: broken images ${info.brokenImages.join(', ')}`);
    check(!info.overflow, `${vp.label} ${v.slug}: horizontal overflow`);
    check(label, `${vp.label} ${v.slug}: illustrative/fictional label missing`);
    check(heroChecks.every(Boolean), `${vp.label} ${v.slug}: a gallery hero image failed to load`);
    if (SHOT_DIR) await page.screenshot({ path: path.join(SHOT_DIR, `${vp.label}-${v.slug}.png`), fullPage: false });
  }

  // 3. Forced image failure -> graceful fallback + still labelled (Bandra view 3)
  const failCtxPage = await ctx.newPage();
  await failCtxPage.route('**/*bandra-3.webp*', (r) => r.abort());
  await failCtxPage.route('**/_next/image?*bandra-3.webp*', (r) => r.abort());
  await failCtxPage.goto(`${BASE_URL}/turfs/bandra-turf-arena-demo`, { waitUntil: 'load' });
  await failCtxPage.locator('img[alt*="thumbnail 3"]').click();
  await failCtxPage.waitForTimeout(1500);
  const fb = await failCtxPage.evaluate(() => {
    const hero = document.querySelector('img[alt*="illustrative"], img[alt*="venue photo"]');
    return {
      heroLoaded: Boolean(hero && hero.complete && hero.naturalWidth > 0),
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      fallbackCaption: document.body.innerText.includes('Illustrative Court Fallback'),
    };
  });
  res.imageFailureFallback = fb;
  check(fb.heroLoaded && fb.fallbackCaption && !fb.overflow, `${vp.label} image-failure fallback not graceful: ${JSON.stringify(fb)}`);
  await failCtxPage.close();

  // 4. Missing + invalid + tampered hold recovery (honest, no fabricated booking)
  res.recovery = {};
  for (const [key, query] of [['missing', ''], ['invalidDemoHold', '?holdId=demo-hold'], ['tampered', '?holdId=gt_bk.eyJ2IjoxfQ.deadbeef']]) {
    const p = await ctx.newPage();
    await p.goto(`${BASE_URL}/turfs/bandra-turf-arena-demo/checkout${query}`, { waitUntil: 'load' });
    await p.locator('[data-testid="checkout-recovery-card"]').waitFor({ state: 'visible', timeout: 20000 });
    const body = await p.evaluate(() => document.body.innerText);
    const lay = await inspect(p);
    res.recovery[key] = {
      heading: ((await p.locator('[data-testid="checkout-recovery-card"] h1').textContent()) || '').trim(),
      fakeSlot: body.includes('06:00 PM – 07:00 PM'),
      fakePin: body.includes('4821'),
      confirmedShown: (await p.locator('[data-testid="booking-confirmed-card"]').count()) > 0,
      overflow: lay.overflow,
    };
    const r = res.recovery[key];
    check(!r.fakeSlot && !r.fakePin && !r.confirmedShown && !r.overflow, `${vp.label} recovery(${key}) dishonest or overflowing: ${JSON.stringify(r)}`);
    await p.close();
  }

  // 5. /bookings is auth-protected: anonymous users must be redirected to /login (server-side authz)
  await page.goto(`${BASE_URL}/bookings`, { waitUntil: 'load' });
  const bookingsUrl = new URL(page.url());
  res.protectedBookingsRoute = {
    redirectedToLogin: bookingsUrl.pathname === '/login',
    showsBookingData: (await page.locator('text=/Match PIN/').count()) > 0,
  };
  check(res.protectedBookingsRoute.redirectedToLogin && !res.protectedBookingsRoute.showsBookingData, `${vp.label} /bookings is not protected for anonymous users`);

  // 6. Slot -> hold -> (release -> retry) -> simulated payment -> confirmation, per venue
  res.bookings = [];
  for (const v of VENUES) {
    res.bookings.push(await bookThroughConfirmation(page, v, vp.slotIndex, { releaseRetry: Boolean(v.releaseRetry) }));
  }
  for (const b of res.bookings) {
    check(b.confirmedLayout && !b.confirmedLayout.overflow && b.confirmedLayout.brokenImages.length === 0, `${vp.label} ${b.slug}: confirmation overflow/broken image`);
  }

  res.hostsContacted = Array.from(hosts).sort();
  check(!res.hostsContacted.some((h) => h.endsWith('supabase.co')), `${vp.label}: browser contacted live Supabase`);
  check(!res.hostsContacted.some((h) => /razorpay|stripe|paypal/i.test(h)), `${vp.label}: browser contacted a payment provider`);
  res.consoleErrors = consoleErrors;
  res.httpErrors = httpErrors;
  res.pageErrors = pageErrors;
  check(pageErrors.length === 0, `${vp.label}: uncaught page errors: ${pageErrors.join(' | ')}`);

  await ctx.close();
  return res;
}

async function main() {
  if (SHOT_DIR) fs.mkdirSync(SHOT_DIR, { recursive: true });
  const server = await startServer();
  let browser;
  const evidence = { generatedAt: new Date().toISOString(), baseUrl: BASE_URL, mode: 'demo+simulator (development server)', viewports: {} };
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    evidence.browser = `Chrome ${browser.version()}`;
    evidence.viewports.desktop = await runViewport(browser, { label: 'desktop-1440x900', width: 1440, height: 900, slotIndex: 0 });
    evidence.viewports.mobile = await runViewport(browser, { label: 'mobile-390x844', width: 390, height: 844, slotIndex: 1 });
  } finally {
    if (browser) await browser.close();
    killGroup(server);
    freePort();
  }
  evidence.failures = failures;
  evidence.status = failures.length === 0 ? 'PASS' : 'FAIL';
  fs.mkdirSync(path.dirname(EVIDENCE_PATH), { recursive: true });
  fs.writeFileSync(EVIDENCE_PATH, JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify({ status: evidence.status, failures, evidence: path.relative(ROOT, EVIDENCE_PATH) }, null, 2));
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  freePort();
  process.exit(2);
});
