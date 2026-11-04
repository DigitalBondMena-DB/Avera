import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, map, of, timeout, type Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_END_POINTS } from '@core/constants/api-end-points';
import { DEFAULT_SETTINGS } from '@core/constants/default-settings';
import type { ISettings } from '@core/models/api.model';
import type { Confirmation } from '@core/models/content.model';
import type { RouteStatus } from '@core/constants/routes';

/** Public business settings from the API (contact lines, confirmations, publication state, integrations). */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly _Api = inject(ApiService);
  readonly settings = signal<ISettings>(DEFAULT_SETTINGS);
  /** True when the API could not be reached and safe defaults are in use. */
  readonly usingFallback = signal(false);

  readonly business = computed(() => this.settings().business);
  readonly integrations = computed(() => this.settings().integrations);

  load(): Observable<void> {
    return this._Api.get<ISettings>(API_END_POINTS.SETTINGS).pipe(
      timeout(4000),
      map(res => {
        this.settings.set(res.data);
        this.usingFallback.set(false);
      }),
      catchError(() => {
        // Typed fallback state, not a silent null: forms will report "not sent", claims stay hidden.
        this.usingFallback.set(true);
        this.settings.set(DEFAULT_SETTINGS);
        return of(undefined);
      }),
    );
  }

  status(path: string): RouteStatus {
    return this.settings().publication.routes[path] ?? 'public';
  }
  isPublic(path: string): boolean { return this.status(path) === 'public'; }
  isAvailable(path: string): boolean { return this.status(path) !== 'draft' || this.settings().publication.showDrafts; }
  isConfirmed(c?: Confirmation): boolean { return !c || this.settings().confirmations[c] === true; }
  confirmed<T extends { requires?: Confirmation }>(items: T[]): T[] { return items.filter(i => this.isConfirmed(i.requires)); }
}
