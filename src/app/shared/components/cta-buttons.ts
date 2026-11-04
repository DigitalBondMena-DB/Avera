import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LeadService } from '@core/services/lead.service';
import { LanguageService } from '@core/services/language.service';
import { SettingsService } from '@core/services/settings.service';
import { Icon } from './icon';

export type BtnVariant = 'primary' | 'secondary' | 'light' | 'outline-light' | 'link';
const cls = (v: BtnVariant, extra = '') => (v === 'link' ? `text-link ${extra}` : `btn btn--${v} ${extra}`).trim();

/** Opens the proposal drawer. Without JavaScript it is a normal link to /contact. */
@Component({
  selector: 'app-proposal-button',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<a [href]="href()" [class]="cls()" data-cta="proposal" (click)="open($event)">{{ label() }}@if (variant() === 'link') {<app-icon name="arrow" [size]="16" />}</a>`,
})
export class ProposalButton {
  private readonly _Lead = inject(LeadService);
  private readonly _Language = inject(LanguageService);
  readonly label = input.required<string>();
  readonly variant = input<BtnVariant>('primary');
  readonly country = input<string | undefined>(undefined);
  readonly service = input<string | undefined>(undefined);
  readonly extraClass = input('');
  protected readonly cls = computed(() => cls(this.variant(), this.extraClass()));
  protected readonly href = computed(() => {
    const q = new URLSearchParams();
    if (this.country()) q.set('country', this.country()!);
    if (this.service()) q.set('service', this.service()!);
    const qs = q.toString();
    return `${this._Language.path('/contact')}${qs ? `?${qs}` : ''}#proposal`;
  });
  open(e: MouseEvent): void {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    this._Lead.open({ kind: 'proposal', country: this.country(), service: this.service() });
  }
}

/** Uses the configured booking URL when there is one; otherwise opens the consultation request form. */
@Component({
  selector: 'app-consultation-button',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (bookingUrl(); as url) {
      <a [href]="url" target="_blank" rel="noopener" [class]="cls()" data-cta="consultation">{{ label() }}</a>
    } @else {
      <a [href]="fallback()" [class]="cls()" data-cta="consultation" (click)="open($event)">{{ label() }}@if (variant() === 'link') {<app-icon name="arrow" [size]="16" />}</a>
    }`,
})
export class ConsultationButton {
  private readonly _Lead = inject(LeadService);
  private readonly _Language = inject(LanguageService);
  readonly label = input.required<string>();
  readonly variant = input<BtnVariant>('secondary');
  readonly extraClass = input('');
  private readonly _Settings = inject(SettingsService);
  protected readonly bookingUrl = computed(() => this._Settings.integrations().bookingUrl);
  protected readonly cls = computed(() => cls(this.variant(), this.extraClass()));
  protected readonly fallback = computed(() => `${this._Language.path('/contact')}?tab=consultation#consultation`);
  open(e: MouseEvent): void {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    this._Lead.open({ kind: 'consultation' });
  }
}

@Component({
  selector: 'app-documents-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<button type="button" [class]="cls()" (click)="open()">{{ label() }}</button>`,
})
export class DocumentsButton {
  private readonly _Lead = inject(LeadService);
  readonly label = input.required<string>();
  readonly variant = input<BtnVariant>('secondary');
  protected readonly cls = computed(() => cls(this.variant()));
  open(): void { this._Lead.open({ kind: 'documents' }); }
}
