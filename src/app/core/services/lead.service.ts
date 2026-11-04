import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, map, of, type Observable } from 'rxjs';
import { ApiService } from './api.service';
import { LanguageService } from './language.service';
import { AnalyticsService } from './analytics.service';
import { API_END_POINTS } from '@core/constants/api-end-points';
import type { ILeadData, ILeadRequest, ILeadResponse, LeadKind, LeadResult } from '@core/models/api.model';

export interface IDrawerState { kind: LeadKind; country?: string; service?: string }
export interface IProposalDraft { step: number; data: ILeadData }

const STORE = 'avera-proposal-v1';
const ACK = 'avera-ack';

/** Drawer state, proposal draft persistence and submission to the Laravel API. */
@Injectable({ providedIn: 'root' })
export class LeadService {
  private readonly _Api = inject(ApiService);
  private readonly _Router = inject(Router);
  private readonly _Language = inject(LanguageService);
  private readonly _Analytics = inject(AnalyticsService);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly drawer = signal<IDrawerState | null>(null);
  /** Values the proposal form should apply when it next opens (country/service preselection). */
  readonly prefill = signal<{ country?: string; service?: string } | null>(null);

  open(state: IDrawerState): void {
    if (state.kind === 'proposal') this.prefill.set({ country: state.country, service: state.service });
    this.drawer.set(state);
  }
  close(): void { this.drawer.set(null); }

  readDraft(): IProposalDraft | null {
    if (!this.browser) return null;
    try {
      const raw = sessionStorage.getItem(STORE);
      return raw ? (JSON.parse(raw) as IProposalDraft) : null;
    } catch { return null; }
  }
  saveDraft(d: IProposalDraft): void {
    if (!this.browser) return;
    try { sessionStorage.setItem(STORE, JSON.stringify(d)); } catch { /* storage unavailable */ }
  }
  clearDraft(): void {
    if (!this.browser) return;
    try { sessionStorage.removeItem(STORE); } catch { /* ignore */ }
  }

  /** Consumes the one-time acknowledgement flag set after a successful submission. */
  consumeAck(): boolean {
    if (!this.browser) return false;
    try {
      const v = sessionStorage.getItem(ACK);
      sessionStorage.removeItem(ACK);
      return !!v;
    } catch { return false; }
  }

  submit(kind: LeadKind, data: ILeadData, website: string): Observable<LeadResult> {
    const body: ILeadRequest = { kind, locale: this._Language.lang(), page: this._Router.url.split('?')[0], website, data };
    return this._Api.post<ILeadResponse>(API_END_POINTS.LEADS, body).pipe(
      map((): LeadResult => {
        try { sessionStorage.setItem(ACK, kind); } catch { /* ignore */ }
        this._Analytics.track('generate_lead', { form_type: kind });
        if (kind === 'proposal') this.clearDraft();
        this.close();
        void this._Router.navigate([`/${this._Language.lang()}/thank-you`], { queryParams: { type: kind } });
        return { status: 'ok' };
      }),
      catchError((e: HttpErrorResponse): Observable<LeadResult> => {
        if (e.status === 503) return of({ status: 'preview' });
        if (e.status === 422) return of({ status: 'invalid', errors: (e.error?.errors ?? {}) as Record<string, string[]> });
        if (e.status === 429) return of({ status: 'error', code: 'rate_limited' });
        if (e.status === 0) return of({ status: 'error', code: 'network' });
        return of({ status: 'error', code: 'generic' });
      }),
    );
  }
}
