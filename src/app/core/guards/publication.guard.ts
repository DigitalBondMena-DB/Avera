import { inject } from '@angular/core';
import type { CanMatchFn } from '@angular/router';
import { SettingsService } from '@core/services/settings.service';

/** Draft routes do not match unless drafts are enabled, so they fall through to the 404 page. */
export const publishedMatch = (path: string): CanMatchFn => () => inject(SettingsService).isAvailable(path);

/** Restricts a :slug route to known slugs (unknown slugs render the localized 404). */
export const slugMatch = (allowed: readonly string[]): CanMatchFn => (_route, segments) =>
  allowed.includes(segments[segments.length - 1]?.path ?? '');
