import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, type AbstractControl } from '@angular/forms';
import { finalize } from 'rxjs';
import { PageContext } from '@core/services/page-context.service';
import { LeadService } from '@core/services/lead.service';
import { EMAIL_PATTERN, PHONE_PATTERN, errorText } from './lead-validators';
import { FormOutcome, ModeBanner, PrivacyLine } from './form-notices';

type Outcome = 'preview' | 'network' | 'rate_limited' | 'generic' | null;

/** Consultation request (when no booking URL is configured) and company-documents request. */
@Component({
  selector: 'app-simple-lead-form',
  imports: [ReactiveFormsModule, ModeBanner, FormOutcome, PrivacyLine],
  templateUrl: './simple-lead-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleLeadForm implements OnInit {
  protected readonly ctx = inject(PageContext);
  private readonly _Lead = inject(LeadService);
  private readonly _Fb = inject(FormBuilder).nonNullable;
  private readonly _Host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly kind = input.required<'consultation' | 'documents'>();
  readonly idPrefix = input('');

  protected readonly busy = signal(false);
  protected readonly attempted = signal(false);
  protected readonly outcome = signal<Outcome>(null);
  protected readonly website = signal('');
  protected readonly f = computed(() => this.ctx.d().forms);

  protected readonly form = this._Fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.maxLength(254), Validators.pattern(EMAIL_PATTERN)]],
    company: ['', [Validators.required, Validators.maxLength(160)]],
    country: [''],
    phone: ['', [Validators.maxLength(40), Validators.pattern(PHONE_PATTERN)]],
    availability: ['', Validators.maxLength(300)],
    topic: ['', Validators.maxLength(2000)],
    documents: ['', Validators.maxLength(2000)],
  });

  ngOnInit(): void {
    if (this.kind() === 'consultation') this.form.controls.country.addValidators(Validators.required);
    if (this.kind() === 'documents') this.form.controls.documents.addValidators(Validators.required);
    // Reuse contact details already typed in the proposal flow.
    const d = this._Lead.readDraft()?.data;
    if (d) this.form.patchValue({ name: d.name ?? '', email: d.email ?? '', company: d.company ?? '', country: d.country ?? '', phone: d.phone ?? '' });
  }

  protected id(k: string): string { return `${this.idPrefix() || this.kind().slice(0, 1)}-${k}`; }
  protected ctrl(k: string): AbstractControl { return this.form.get(k)!; }
  protected err(k: string): string | null {
    const c = this.ctrl(k);
    if (!c.invalid || (!c.touched && !this.attempted())) return null;
    return errorText(c.errors, this.f().errors);
  }
  protected onWebsite(e: Event): void { this.website.set((e.target as HTMLInputElement).value); }

  protected submit(): void {
    this.attempted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      setTimeout(() => this._Host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    const v = this.form.getRawValue();
    const data = this.kind() === 'documents'
      ? { name: v.name, email: v.email, company: v.company, country: v.country || undefined, documents: v.documents }
      : { name: v.name, email: v.email, company: v.company, country: v.country, phone: v.phone || undefined, availability: v.availability || undefined, topic: v.topic || undefined };
    this.busy.set(true);
    this.outcome.set(null);
    this._Lead.submit(this.kind(), data, this.website()).pipe(finalize(() => this.busy.set(false))).subscribe(r => {
      if (r.status === 'ok') return;
      if (r.status === 'invalid') {
        for (const [key, msgs] of Object.entries(r.errors)) {
          const c = this.form.get(key.replace(/^data\./, ''));
          c?.setErrors({ server: msgs[0] });
          c?.markAsTouched();
        }
        return;
      }
      this.outcome.set(r.status === 'preview' ? 'preview' : r.code);
    });
  }
}
