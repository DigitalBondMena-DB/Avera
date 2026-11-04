// End-to-end checks against a running server.
// Usage: BASE=http://localhost:4000 API=http://localhost:8000/api/v1 EXPECT=live|preview node tests/e2e.mjs
// live = the API has a delivery channel (e.g. webhook) configured; preview = none configured.
// Playwright is resolved from PW_ROOT (global node_modules) or the local install.
import { createRequire } from 'node:module';
const req = createRequire(process.env.PW_ROOT ? process.env.PW_ROOT + '/' : import.meta.url);
const { chromium } = req('playwright');

const BASE = process.env.BASE || 'http://localhost:3000';
const EXPECT = process.env.EXPECT || 'preview';
const API = process.env.API || 'http://localhost:8000/api/v1';
const ROUTES = ['/', '/about', '/careers', '/services', '/services/employer-of-record', '/services/payroll', '/services/social-insurance',
  '/services/health-life', '/services/talent-acquisition', '/services/legal-labor-relations', '/services/training', '/services/workspace',
  '/services/events', '/markets', '/markets/saudi-arabia', '/markets/uae', '/markets/qatar', '/markets/kuwait', '/markets/international',
  '/markets/why-egypt', '/how-it-works', '/industries', '/pricing', '/faq', '/contact', '/privacy', '/terms', '/cookies', '/sitemap', '/trust'];
const DRAFTS = ['/about/leadership', '/about/clients', '/insights', '/guides/hiring-in-egypt'];

let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log('  ✗ ' + msg); } }
const L = (loc, p) => `/${loc}${p === '/' ? '' : p}`;


/** Zoneless Angular renders on the next frame: poll a condition briefly instead of reading state synchronously. */
async function until(fn, timeout = 3000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    try { if (await fn()) return true; } catch { /* element not there yet */ }
    await new Promise(r => setTimeout(r, 50));
  }
  return false;
}

const browser = await chromium.launch();

// 1. Every public route in both languages: status, lang/dir, one h1, canonical, hreflang, overflow at 4 widths.
console.log('Routes, metadata and overflow');
const links = new Set();
for (const w of [1440, 1024, 768, 390]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  for (const loc of ['en', 'ar']) {
    for (const r of ROUTES) {
      const url = BASE + L(loc, r);
      const res = await page.goto(url, { waitUntil: 'domcontentloaded' });
      ok(res.status() === 200, `${url} status ${res.status()}`);
      const info = await page.evaluate(() => ({
        lang: document.documentElement.lang, dir: document.documentElement.dir,
        h1: document.querySelectorAll('h1').length,
        canonical: document.querySelector('link[rel=canonical]')?.getAttribute('href'),
        alts: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map(l => l.getAttribute('hreflang')).sort().join(','),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        noAlt: [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).length,
        leaks: /\[__\]|content needed|before launch|lorem/i.test(document.body.innerText),
        hrefs: [...document.querySelectorAll('a[href^="/"]')].map(a => a.getAttribute('href')),
      }));
      ok(info.overflow <= 0, `${url} @${w} horizontal overflow ${info.overflow}px`);
      if (w === 1440) {
        ok(info.lang === loc && info.dir === (loc === 'ar' ? 'rtl' : 'ltr'), `${url} lang/dir ${info.lang}/${info.dir}`);
        ok(info.h1 === 1, `${url} has ${info.h1} h1`);
        ok(info.canonical?.endsWith(L(loc, r)), `${url} canonical ${info.canonical}`);
        ok(info.alts === 'ar,en,x-default', `${url} hreflang ${info.alts}`);
        ok(info.noAlt === 0, `${url} images without alt: ${info.noAlt}`);
        ok(!info.leaks, `${url} leaks placeholder/editorial text`);
        info.hrefs.forEach(h => links.add(h.split('#')[0]));
      }
    }
  }
  await page.close();
}

// 2. Every internal link found resolves.
console.log(`Internal links (${links.size})`);
for (const h of links) {
  const res = await fetch(BASE + h, { redirect: 'manual' });
  ok(res.status === 200, `link ${h} → ${res.status}`);
}

// 3. Drafts hidden, localized 404s, root redirect, sitemap content.
console.log('Drafts, 404s, sitemap');
for (const loc of ['en', 'ar']) for (const r of DRAFTS) {
  const res = await fetch(BASE + L(loc, r));
  ok(res.status === 404, `draft ${L(loc, r)} should 404, got ${res.status}`);
}
{
  const page = await browser.newPage();
  const res = await page.goto(BASE + '/ar/does-not-exist/deep', { waitUntil: 'networkidle' });
  ok(res.status() === 404, 'unknown AR path 404');
  ok((await page.locator('h1').innerText()).includes('لم نعثر'), 'AR 404 is localized');
  ok(await page.evaluate(() => document.documentElement.dir) === 'rtl', 'AR 404 keeps rtl');
  const root = await fetch(BASE + '/', { redirect: 'manual' });
  ok([301, 302, 307, 308].includes(root.status) && root.headers.get('location')?.endsWith('/en'), 'root redirects to /en');
  const sm = await (await fetch(BASE + '/sitemap.xml')).text();
  ok(!/thank-you|leadership|clients|insights|guides/.test(sm), 'sitemap excludes drafts and thank-you');
  ok((sm.match(/<loc>/g) || []).length === ROUTES.length * 2, `sitemap has ${(sm.match(/<loc>/g) || []).length} urls`);
  await page.close();
}

// 4. Language switch keeps the nested route and query string.
console.log('Language switch');
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + '/en/markets/saudi-arabia?utm_source=test', { waitUntil: 'networkidle' });
  await page.locator('.utility .lang-switch').click();
  await page.waitForURL('**/ar/markets/saudi-arabia?utm_source=test');
  ok(page.url().endsWith('/ar/markets/saudi-arabia?utm_source=test'), 'EN→AR keeps path and query');
  await page.locator('.utility .lang-switch').click();
  await page.waitForURL('**/en/markets/saudi-arabia?utm_source=test');
  ok(true, 'AR→EN back');
  await page.close();
}

// 5. Keyboard: mega menu opens with Enter, Escape closes and returns focus.
console.log('Keyboard menus');
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + '/en', { waitUntil: 'networkidle' });
  const trigger = page.locator('.nav__trigger').first();
  await trigger.focus();
  await page.keyboard.press('Enter');
  ok(await until(async () => await trigger.getAttribute('aria-expanded') === 'true'), 'Services menu opens with Enter');
  await page.keyboard.press('Tab');
  ok(await until(async () => await page.evaluate(() => !!document.activeElement?.closest('.mega'))), 'Tab moves into the open menu');
  await page.keyboard.press('Escape');
  ok(await until(async () => await trigger.getAttribute('aria-expanded') === 'false'), 'Escape closes menu');
  ok(await until(async () => await page.evaluate(() => document.activeElement?.classList.contains('nav__trigger'))), 'focus returns to trigger');
  // FAQ disclosure via keyboard
  await page.goto(BASE + '/en/faq', { waitUntil: 'networkidle' });
  await page.locator('.faq__item summary').first().focus();
  await page.keyboard.press('Enter');
  ok(await until(async () => await page.locator('.faq__item').first().getAttribute('open') !== null), 'FAQ opens with Enter');
  await page.close();
}

// 6. Mobile menu: dialog, focus trap, Escape.
console.log('Mobile menu and bar');
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE + '/ar/services/payroll', { waitUntil: 'networkidle' });
  ok(await until(async () => await page.locator('.mobile-bar').isVisible()), 'mobile bar visible on phone');
  const pad = await page.evaluate(() => parseFloat(getComputedStyle(document.body).paddingBottom));
  ok(pad >= 60, `body reserves space for mobile bar (${pad}px)`);
  await page.locator('.menu-btn').click();
  ok(await until(async () => await page.locator('.mobile-menu[role=dialog]').isVisible()), 'mobile menu opens');
  for (let i = 0; i < 40; i++) await page.keyboard.press('Tab');
  ok(await until(async () => await page.evaluate(() => !!document.activeElement?.closest('.mobile-menu'))), 'focus trapped in mobile menu');
  await page.keyboard.press('Escape');
  ok(await until(async () => !(await page.locator('.mobile-menu').count())), 'Escape closes mobile menu');
  ok(await until(async () => await page.evaluate(() => document.activeElement?.classList.contains('menu-btn'))), 'focus restored to menu button');
  await page.close();
}

// 7. Proposal flow: drawer, validation, state, preselection, submission.
console.log(`Proposal flow (expect ${EXPECT})`);
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + '/en/markets/uae', { waitUntil: 'networkidle' });
  await page.locator('.page-hero [data-cta=proposal]').click();
  const dialog = page.locator('[role=dialog][aria-modal=true]');
  ok(await until(async () => await dialog.isVisible()), 'drawer opens');
  ok(await until(async () => await page.evaluate(() => document.documentElement.classList.contains('is-locked'))), 'body scroll locked');
  await page.waitForTimeout(100);
  ok(await until(async () => await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]'))), 'focus moved into drawer');
  await page.keyboard.press('Escape');
  ok(await until(async () => !(await dialog.count())), 'Escape closes drawer');
  ok(await until(async () => await page.evaluate(() => document.activeElement?.getAttribute('data-cta') === 'proposal')), 'focus restored to opener');

  await page.locator('.page-hero [data-cta=proposal]').click();
  await page.getByRole('button', { name: 'Continue' }).click();
  ok(await until(async () => await page.locator('.field__error').count() >= 3), 'step 1 required errors shown');
  ok(await until(async () => await page.locator('[aria-invalid=true]').count() >= 2), 'aria-invalid set');
  await page.locator('.choice__item', { hasText: '6–20' }).click();
  await page.fill('#p-roles', 'Two engineers and an accountant');
  await page.selectOption('#p-start', '1-3-months');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  ok(await until(async () => await page.locator('.field__error').isVisible()), 'step 2 requires a service');
  await page.locator('.choice__item', { hasText: 'Employer of Record' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  ok(await until(async () => await page.inputValue('#p-country') === 'AE'), 'UAE preselected from country page');
  await page.fill('#p-name', 'Test Person');
  await page.fill('#p-email', 'not-an-email');
  await page.fill('#p-company', 'Example Co');
  await page.getByRole('button', { name: 'Send my request' }).click();
  ok(await until(async () => (await page.locator('#p-email-err').innerText()).includes('valid email')), 'email syntax error shown');
  await page.fill('#p-email', 'test@gmail.com');
  await page.locator('#p-company').focus();
  ok(await until(async () => await page.locator('#p-email-hint').isVisible()), 'non-blocking free-mail hint shown');
  await page.getByRole('button', { name: 'Send my request' }).click();
  if (EXPECT === 'live') {
    await page.waitForURL('**/en/thank-you?type=proposal', { timeout: 10000 });
    ok(await until(async () => (await page.locator('h1').innerText()).startsWith('Thank you. Your request')), 'thank-you confirms after server ack');
    await page.reload();
    ok(await until(async () => !(await page.locator('h1').innerText()).includes('Your request is with')), 'thank-you reload does not re-confirm');
  } else {
    await page.locator('.notice--warn[role=alert]').waitFor({ timeout: 10000 });
    ok(await until(async () => (await page.locator('.notice--warn[role=alert]').innerText()).includes('has not been sent')), 'preview mode says request was not sent');
    ok(await until(async () => await page.locator('.notice--warn a[href^="mailto:"]').count() === 1), 'preview offers direct email');
    ok(await until(async () => await page.inputValue('#p-name') === 'Test Person'), 'data retained after preview response');
    ok(!page.url().includes('thank-you'), 'no thank-you page without delivery');
  }
  await page.close();
}

// 8. Proposal state survives a language switch; service preselection from a service page.
console.log('State across language switch');
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + '/en/services/payroll', { waitUntil: 'networkidle' });
  await page.locator('.media-hero [data-cta=proposal]').click();
  await page.fill('#p-roles', 'Payroll team of four');
  await page.keyboard.press('Escape');
  await page.locator('.utility .lang-switch').click();
  await page.waitForURL('**/ar/services/payroll');
  await page.locator('.media-hero [data-cta=proposal]').click();
  ok(await until(async () => await page.inputValue('#p-roles') === 'Payroll team of four'), 'typed roles kept after switching to Arabic');
  ok(await until(async () => (await page.locator('.drawer__title').innerText()) === 'طلب عرض مخصص'), 'drawer is in Arabic');
  await page.locator('.choice__item', { hasText: '6–20' }).click();
  await page.selectOption('#p-start', 'asap');
  await page.getByRole('button', { name: 'متابعة' }).click();
  ok(await until(async () => await page.locator('.choice__item.is-on', { hasText: 'إدارة الرواتب' }).count() === 1), 'payroll preselected from service page');
  await page.close();
}

// 9. Consultation and documents requests (Arabic validation).
console.log('Consultation and documents forms');
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE + '/ar/trust', { waitUntil: 'networkidle' });
  await page.locator('.facts-box button').click();
  await page.getByRole('button', { name: 'إرسال الطلب' }).click();
  ok(await until(async () => (await page.locator('.field__error').count()) >= 4), 'documents form shows Arabic required errors');
  ok(await until(async () => (await page.locator('.field__error').first().innerText()).includes('مطلوب')), 'errors are in Arabic');
  const box = await page.locator('.drawer').boundingBox();
  ok(box && box.width >= 389, 'drawer is full screen on phone');
  await page.close();
}

// 10. API: server-side validation, envelope and method handling.
console.log('API');
{
  const post = (body, lang = 'en') => fetch(API + '/leads', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'Accept-Language': lang }, body: JSON.stringify(body) });
  const bad = await post({ kind: 'proposal', locale: 'en', data: { email: 'x' } });
  ok(bad.status === 422, `invalid payload → ${bad.status}`);
  const j = await bad.json();
  ok(j.success === false && j.errors?.['data.email'] && j.errors?.['data.services'], 'server returns envelope with field errors');
  const ar = await (await post({ kind: 'documents', locale: 'ar', data: {} }, 'ar')).json();
  ok(String(ar.errors?.['data.name']?.[0]).includes('مطلوب'), 'server validation messages in Arabic');
  const kind = await post({ kind: 'spam', locale: 'en', data: {} });
  ok(kind.status === 422, 'unknown kind rejected');
  const get = await fetch(API + '/leads', { headers: { Accept: 'application/json' } });
  ok(get.status === 405 && (await get.json()).success === false, 'GET → 405 envelope');
  const settings = await (await fetch(API + '/settings')).json();
  ok(settings.success === true && settings.data.integrations.leadsLive === (EXPECT === 'live'), 'settings report delivery state');
}

// 11. Images: hero is eager/high priority, the rest lazy; everything loads.
console.log('Images');
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + '/en', { waitUntil: 'networkidle' });
  const hero = page.locator('.hero img');
  ok(await hero.getAttribute('loading') === 'eager' && await hero.getAttribute('fetchpriority') === 'high', 'hero eager + high priority');
  ok(await page.locator('.split__media img').count() === 0, 'below-fold images deferred until near the viewport');
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); } });
  await page.waitForLoadState('networkidle');
  ok(await page.locator('.split__media img').first().getAttribute('loading') === 'lazy', 'below-fold image lazy once rendered');
  const broken = await page.evaluate(() => [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.currentSrc));
  ok(broken.length === 0, `broken images: ${broken.join(', ')}`);
  await page.close();
}

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
if (fail) { console.log(failures.join('\n')); process.exit(1); }
