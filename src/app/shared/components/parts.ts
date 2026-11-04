import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageContext } from '@core/services/page-context.service';
import type { IFaq, IItem, ServiceSlug } from '@core/models/content.model';
import { pad2, telHref } from '@core/utils/links';
import { Icon } from './icon';
import { ProposalButton, ConsultationButton } from './cta-buttons';

@Component({
  selector: 'app-breadcrumbs',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="crumbs" [attr.aria-label]="ctx.d().common.breadcrumb">
      <ol>
        @for (c of all(); track c.path; let last = $last) {
          <li>@if (!last) {<a [routerLink]="ctx.L(c.path)">{{ c.label }}</a>} @else {<span aria-current="page">{{ c.label }}</span>}</li>
        }
      </ol>
    </nav>`,
})
export class Breadcrumbs {
  protected readonly ctx = inject(PageContext);
  readonly trail = input.required<{ label: string; path: string }[]>();
  protected readonly all = computed(() => [{ label: this.ctx.d().common.home, path: '/' }, ...this.trail()]);
  constructor() {
    effect(() => this.ctx._Seo.breadcrumbs(this.ctx.lang(), this.all()));
  }
}

/** Typographic page hero; project actions into it. */
@Component({
  selector: 'app-page-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section [class]="'page-hero page-hero--' + tone()">
      <div class="container page-hero__inner">
        @if (eyebrow()) { <p class="eyebrow">{{ eyebrow() }}</p> }
        <h1 class="page-hero__title">{{ title() }}</h1>
        @if (lead()) { <p class="page-hero__lead">{{ lead() }}</p> }
        <div class="page-hero__actions empty:hidden"><ng-content /></div>
      </div>
    </section>`,
})
export class PageHero {
  readonly eyebrow = input<string>('');
  readonly title = input.required<string>();
  readonly lead = input<string>('');
  readonly tone = input<'ivory' | 'navy' | 'white'>('ivory');
}

@Component({
  selector: 'app-cta-band',
  imports: [ProposalButton, ConsultationButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="cta-band">
      <div class="container cta-band__inner">
        <div class="cta-band__text">
          <span class="diamond-rule" aria-hidden="true"></span>
          <h2 class="cta-band__title">{{ title() }}</h2>
          <p>{{ text() }}</p>
        </div>
        <div class="cta-band__actions">
          @if (consultationFirst()) {
            <app-consultation-button [label]="ctx.d().common.bookConsultation" variant="light" />
            <app-proposal-button [label]="ctx.d().common.getProposal" variant="outline-light" [country]="country()" [service]="service()" />
          } @else {
            <app-proposal-button [label]="ctx.d().common.getProposal" variant="light" [country]="country()" [service]="service()" />
            <app-consultation-button [label]="ctx.d().common.bookConsultation" variant="outline-light" />
          }
        </div>
      </div>
    </section>`,
})
export class CtaBand {
  protected readonly ctx = inject(PageContext);
  readonly title = input.required<string>();
  readonly text = input.required<string>();
  readonly country = input<string | undefined>(undefined);
  readonly service = input<string | undefined>(undefined);
  readonly consultationFirst = input(false);
}

/** Ruled list (no cards). Items needing business confirmation are filtered out. */
@Component({
  selector: 'app-ruled-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul [class]="'ruled ruled--' + columns() + (numbered() ? ' ruled--numbered' : '')">
      @for (it of visible(); track it.title; let i = $index) {
        <li>
          @if (numbered()) { <span class="ruled__n">{{ pad(i + 1) }}</span> }
          <div>
            <h3 class="ruled__title">{{ it.title }}</h3>
            @if (it.text) { <p class="ruled__text">{{ it.text }}</p> }
          </div>
        </li>
      }
    </ul>`,
})
export class RuledList {
  private readonly ctx = inject(PageContext);
  readonly items = input.required<IItem[]>();
  readonly numbered = input(false);
  readonly columns = input<1 | 2 | 3>(2);
  protected readonly visible = computed(() => this.ctx._Settings.confirmed(this.items()));
  protected readonly pad = pad2;
}

@Component({
  selector: 'app-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol [class]="'timeline' + (compact() ? ' timeline--compact' : '')">
      @for (s of steps(); track s.title; let i = $index) {
        <li class="timeline__step">
          <span class="timeline__n" aria-hidden="true">{{ i + 1 }}</span>
          <div>
            <h3 class="timeline__title">{{ s.title }}</h3>
            @if (s.text) { <p class="timeline__text">{{ s.text }}</p> }
          </div>
        </li>
      }
    </ol>`,
})
export class Steps {
  readonly steps = input.required<IItem[]>();
  readonly compact = input(false);
}

/** Native disclosure FAQ. Optional FAQPage schema that always matches what is visible. */
@Component({
  selector: 'app-faq-list',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible().length) {
      <div class="faq">
        @for (f of visible(); track f.q) {
          <details class="faq__item">
            <summary><span>{{ f.q }}</span><app-icon name="plus" /></summary>
            <div class="faq__a"><p>{{ f.a }}</p></div>
          </details>
        }
      </div>
    }`,
})
export class FaqList {
  private readonly ctx = inject(PageContext);
  readonly items = input.required<IFaq[]>();
  readonly schemaId = input<string | null>(null);
  protected readonly visible = computed(() => this.ctx._Settings.confirmed(this.items()));
  constructor() {
    effect(() => {
      const id = this.schemaId();
      const v = this.visible();
      if (!id || !v.length) return;
      this.ctx._Seo.jsonLd(id, {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: v.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      });
    });
  }
}

@Component({
  selector: 'app-contact-lines',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="contact-lines">
      @for (p of phones(); track p.id) {
        <li><span class="contact-lines__label">{{ p.region === 'SA' ? ctx.d().common.ksa : ctx.d().common.egypt }}</span>
          <a [href]="tel(p.display)"><bdi dir="ltr">{{ p.display }}</bdi></a></li>
      }
      <li><span class="contact-lines__label">{{ ctx.d().common.email }}</span>
        <a [href]="'mailto:' + biz().email"><bdi dir="ltr">{{ biz().email }}</bdi></a></li>
    </ul>`,
})
export class ContactLines {
  protected readonly ctx = inject(PageContext);
  readonly phoneIds = input<string[] | null>(null);
  protected readonly biz = this.ctx._Settings.business;
  protected readonly phones = computed(() => {
    const all = this.biz().phones, ids = this.phoneIds();
    return ids ? ids.map(id => all.find(p => p.id === id)).filter(p => !!p) : all;
  });
  protected readonly tel = telHref;
}

@Component({
  selector: 'app-related-services',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section section--tight">
      <div class="container">
        <h2 class="h3">{{ ctx.d().common.relatedServices }}</h2>
        <ul class="service-rows service-rows--3">
          @for (s of slugs(); track s) {
            <li><a [routerLink]="ctx.L('/services/' + s)" class="service-row">
              <span class="service-row__name">{{ ctx.d().services[s].name }}</span>
              <span class="service-row__short">{{ ctx.d().services[s].short }}</span>
              <app-icon name="arrow" />
            </a></li>
          }
        </ul>
      </div>
    </section>`,
})
export class RelatedServices {
  protected readonly ctx = inject(PageContext);
  readonly slugs = input.required<ServiceSlug[]>();
}

@Component({
  selector: 'app-draft-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="draft-banner" role="note"><div class="container">{{ ctx.d().common.draftBanner }}</div></div>`,
})
export class DraftBanner { protected readonly ctx = inject(PageContext); }

@Component({
  selector: 'app-arrow-link',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<a [routerLink]="to()" [fragment]="fragment()" [class]="'text-link ' + extraClass()"><ng-content /><app-icon name="arrow" [size]="16" /></a>`,
})
export class ArrowLink {
  readonly to = input.required<string>();
  readonly fragment = input<string | undefined>(undefined);
  readonly extraClass = input('');
}
