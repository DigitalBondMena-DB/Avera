// WebP derivatives from the PNG masters in assets-src/photography (never upscaled).
// Output: public/images/<name>-<width>.webp + src/app/core/constants/image-manifest.json
import sharp from 'sharp';
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const src = path.join(root, 'assets-src', 'photography');
const out = path.join(root, 'public', 'images');
const WIDTHS = [480, 800, 1200, 1536];
await mkdir(out, { recursive: true });
const manifest = {};
for (const file of (await readdir(src)).filter(f => f.endsWith('.png'))) {
  const name = file.replace(/\.png$/, '');
  const meta = await sharp(path.join(src, file)).metadata();
  const widths = WIDTHS.filter(w => w <= meta.width);
  manifest[name] = { width: meta.width, height: meta.height, widths };
  for (const w of widths) {
    const target = path.join(out, `${name}-${w}.webp`);
    try { await stat(target); continue; } catch { /* build it */ }
    await sharp(path.join(src, file)).resize({ width: w, withoutEnlargement: true }).webp({ quality: 76 }).toFile(target);
  }
}
await mkdir(path.join(root, 'src/app/core/constants'), { recursive: true });
await writeFile(path.join(root, 'src/app/core/constants/image-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('images:', Object.keys(manifest).join(', '));
