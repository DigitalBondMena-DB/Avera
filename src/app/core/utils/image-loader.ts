import type { ImageLoaderConfig } from '@angular/common';
import manifest from '@core/constants/image-manifest.json';

type Entry = { width: number; height: number; widths: number[] };
const m = manifest as Record<string, Entry>;

export const IMAGE_BREAKPOINTS = [480, 800, 1200, 1536];

/** Maps NgOptimizedImage requests (src = image key) to the pre-generated WebP derivative of the nearest available width. */
export function averaImageLoader(config: ImageLoaderConfig): string {
  const e = m[config.src];
  if (!e) return config.src;
  const want = config.width ?? 1200;
  const w = e.widths.find(x => x >= want) ?? e.widths[e.widths.length - 1];
  return `/images/${config.src}-${w}.webp`;
}

export function imageSize(key: string): { width: number; height: number } {
  const e = m[key];
  return { width: e?.width ?? 1536, height: e?.height ?? 1024 };
}
