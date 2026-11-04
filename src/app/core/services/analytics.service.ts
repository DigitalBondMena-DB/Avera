import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type ConsentValue = 'granted' | 'denied';
const KEY = 'avera-consent-v1';

type Gtag = (...args: unknown[]) => void;
interface IAnalyticsWindow { dataLayer?: unknown[]; gtag?: Gtag; _linkedin_partner_id?: string; _linkedin_data_partner_ids?: string[] }

/** Consent-aware loading of GA4 / LinkedIn Insight. Nothing optional loads before "Accept". Never receives personal data. */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly _Document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly bannerOpen = signal(false);
  private ids: { ga4: string | null; linkedin: string | null } = { ga4: null, linkedin: null };

  get configured(): boolean { return !!(this.ids.ga4 || this.ids.linkedin); }
  private get win(): IAnalyticsWindow { return this._Document.defaultView as unknown as IAnalyticsWindow; }

  init(ga4: string | null, linkedin: string | null): void {
    this.ids = { ga4, linkedin };
    if (!this.browser || !this.configured) return;
    const v = this.read();
    if (v === 'granted') this.load(); else if (!v) this.bannerOpen.set(true);
  }

  read(): ConsentValue | null {
    if (!this.browser) return null;
    try {
      const v = localStorage.getItem(KEY);
      return v === 'granted' || v === 'denied' ? v : null;
    } catch { return null; }
  }

  choose(v: ConsentValue): void {
    const prev = this.read();
    try { localStorage.setItem(KEY, v); } catch { /* ignore */ }
    this.bannerOpen.set(false);
    if (prev === 'granted' && v === 'denied') this._Document.defaultView?.location.reload();
    else if (v === 'granted') this.load();
  }

  track(event: string, params: Record<string, string | number> = {}): void {
    if (this.read() !== 'granted') return;
    this.win.gtag?.('event', event, params);
  }

  private load(): void {
    const doc = this._Document, w = this.win;
    if (this.ids.ga4 && !doc.getElementById('ga4')) {
      w.dataLayer = w.dataLayer || [];
      w.gtag = function gtag() { w.dataLayer!.push(arguments); } as Gtag;
      w.gtag('js', new Date());
      w.gtag('config', this.ids.ga4, { anonymize_ip: true });
      const s = doc.createElement('script');
      s.id = 'ga4'; s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(this.ids.ga4)}`;
      doc.head.appendChild(s);
    }
    if (this.ids.linkedin && !doc.getElementById('li-insight')) {
      w._linkedin_partner_id = this.ids.linkedin;
      w._linkedin_data_partner_ids = [...(w._linkedin_data_partner_ids || []), this.ids.linkedin];
      const s = doc.createElement('script');
      s.id = 'li-insight'; s.async = true; s.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
      doc.head.appendChild(s);
    }
  }
}
