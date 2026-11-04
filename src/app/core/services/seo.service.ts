import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '@env/environment';
import type { Lang } from '@core/constants/routes';
import type { IPageMeta } from '@core/models/content.model';

/** Title, description, canonical, hreflang, Open Graph, robots and JSON-LD. Runs on the server too. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly _Title = inject(Title);
  private readonly _Meta = inject(Meta);
  private readonly _Document = inject(DOCUMENT);

  url(lang: Lang, path: string): string {
    return `${environment.siteUrl}/${lang}${path === '/' ? '' : path}`;
  }

  set(lang: Lang, path: string, meta: IPageMeta, opts: { noindex?: boolean } = {}): void {
    const url = this.url(lang, path);
    this._Title.setTitle(meta.title);
    this._Meta.updateTag({ name: 'description', content: meta.description });
    this._Meta.updateTag({ name: 'robots', content: opts.noindex ? 'noindex, nofollow' : 'index, follow' });
    this._Meta.updateTag({ property: 'og:title', content: meta.title });
    this._Meta.updateTag({ property: 'og:description', content: meta.description });
    this._Meta.updateTag({ property: 'og:url', content: url });
    this._Meta.updateTag({ property: 'og:type', content: 'website' });
    this._Meta.updateTag({ property: 'og:locale', content: lang === 'ar' ? 'ar_EG' : 'en_US' });
    this._Meta.updateTag({ property: 'og:image', content: `${environment.siteUrl}/og-default.jpg` });
    this._Meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.link('canonical', url);
    this.link('alternate', this.url('en', path), 'en');
    this.link('alternate', this.url('ar', path), 'ar');
    this.link('alternate', this.url('en', path), 'x-default');
    this.clearJsonLd();
  }

  private link(rel: string, href: string, hreflang?: string): void {
    const head = this._Document.head;
    const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
    let el = head.querySelector<HTMLLinkElement>(sel);
    if (!el) {
      el = this._Document.createElement('link');
      el.setAttribute('rel', rel);
      if (hreflang) el.setAttribute('hreflang', hreflang);
      head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

  /** Adds a JSON-LD block for the current page. */
  jsonLd(id: string, data: object): void {
    const doc = this._Document;
    let el = doc.getElementById(`ld-${id}`);
    if (!el) {
      el = doc.createElement('script');
      el.setAttribute('type', 'application/ld+json');
      el.id = `ld-${id}`;
      el.setAttribute('data-page-ld', '');
      doc.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
  }

  breadcrumbs(lang: Lang, trail: { label: string; path: string }[]): void {
    this.jsonLd('breadcrumbs', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: trail.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: this.url(lang, c.path) })),
    });
  }

  private clearJsonLd(): void {
    this._Document.head.querySelectorAll('script[data-page-ld]').forEach(s => s.remove());
  }
}
