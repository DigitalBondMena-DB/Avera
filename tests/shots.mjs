// Usage: node tests/shots.mjs <baseUrl> <path> <widths,comma> [fullPage=1]
import { createRequire } from 'node:module';
const { chromium } = createRequire(process.env.PW_ROOT + '/')('playwright');
const [base, path, widths = '1440', full = '1'] = process.argv.slice(2);
const browser = await chromium.launch();
for (const w of widths.split(',').map(Number)) {
  const page = await browser.newPage({ viewport: { width: w, height: w < 500 ? 844 : 900 }, deviceScaleFactor: 1 });
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
  await page.waitForLoadState('networkidle');
  const name = `${path.replace(/\//g, '_') || 'root'}-${w}.png`;
  await page.screenshot({ path: `tests/screenshots/${name}`, fullPage: full === '1' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(name, 'overflow:', overflow);
  await page.close();
}
await browser.close();
