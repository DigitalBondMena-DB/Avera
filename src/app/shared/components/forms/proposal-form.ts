import { ChangeDetectionStrategy, Component, DOCUMENT, ElementRef, afterNextRender, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, type AbstractControl, type FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { PageContext } from '@core/services/page-context.service';
import { LeadService } from '@core/services/lead.service';
import { AnalyticsService } from '@core/services/analytics.service';
import type { ILeadData } from '@core/models/api.model';
import { EMAIL_PATTERN, PHONE_PATTERN, errorText, isFreeEmail, minSelected } from './lead-validators';
import { FormOutcome, ModeBanner, PrivacyLine } from './form-notices';

type Outcome = 'preview' | 'network' | 'rate_limited' | 'generic' | null;
const STEP_KEYS = ['team', 'services', 'contact'] as const;

/** The canonical three-step proposal flow (drawer and /contact). State survives page and language changes. */
@Component({
  selector: 'app-proposal-form',
  imports: [ReactiveFormsModule, ModeBanner, FormOutcome, PrivacyLine],
  templateUrl: './proposal-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Client state (saved draft, current step) differs from the server render by design.
  host: { ngSkipHydration: 'true' },
})
export class ProposalForm {
  protected readonly ctx = inject(PageContext);
  private readonly _Lead = inject(LeadService);
  private readonly _Analytics = inject(AnalyticsService);
  private readonly _Fb = inject(FormBuilder).nonNullable;
  private readonly _Host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _Document = inject(DOCUMENT);
  readonly idPrefix = input('p');

  protected readonly step = signal(0);
  protected readonly busy = signal(false);
  protected readonly outcome = signal<Outcome>(null);
  protected readonly attempted = signal<boolean[]>([false, false, false]);
  protected readonly freeHint = signal(false);
  protected readonly website = signal('');
  protected readonly f = computed(() => this.ctx.d().forms);

  protected readonly form = this._Fb.group({
    team: this._Fb.group({
      employees: ['', Validators.required],
      roles: ['', [Validators.required, Validators.maxLength(500)]],
      start: ['', Validators.required],
    }),
    services: this._Fb.group({
      services: this._Fb.control<string[]>([], minSelected(1)),
      message: ['', Validators.maxLength(2000)],
    }),
    contact: this._Fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      email: ['', [Validators.required, Validators.maxLength(254), Validators.pattern(EMAIL_PATTERN)]],
      company: ['', [Validators.required, Validators.maxLength(160)]],
      country: ['', Validators.required],
      phone: ['', [Validators.maxLength(40), Validators.pattern(PHONE_PATTERN)]],
    }),
  });

  constructor() {
    // Order matters: restore the saved draft first (browser only), then apply any preselection,
    // and only then start saving, so a preselection can never overwrite what the visitor typed.
    const draft = this._Lead.readDraft();
    if (draft) {
      this.patch(draft.data);
      this.step.set(Math.min(Math.max(draft.step, 0), 2));
    }
    this.applyPrefill();
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.save());
    effect(() => { if (this._Lead.prefill()) this.applyPrefill(); });
    afterNextRender(() => this.save());
  }

  protected group(i: number): FormGroup { return this.form.get(STEP_KEYS[i]) as FormGroup; }
  protected id(k: string): string { return `${this.idPrefix()}-${k}`; }

  protected ctrl(path: string): AbstractControl { return this.form.get(path)!; }
  protected err(path: string): string | null {
    const c = this.ctrl(path);
    const stepIdx = STEP_KEYS.indexOf(path.split('.')[0] as (typeof STEP_KEYS)[number]);
    if (!c.invalid || (!c.touched && !this.attempted()[stepIdx])) return null;
    return errorText(c.errors, this.f().errors);
  }
  protected hasErrors(): boolean {
    return this.attempted()[this.step()] && this.group(this.step()).invalid;
  }

  protected isOn(v: string): boolean { return this.ctrl('services.services').value.includes(v); }
  protected toggleService(v: string): void {
    const c = this.ctrl('services.services');
    const cur: string[] = c.value;
    const next = v === 'not-sure' ? (cur.includes(v) ? [] : ['not-sure'])
      : cur.includes(v) ? cur.filter(x => x !== v) : [...cur.filter(x => x !== 'not-sure'), v];
    c.setValue(next);
    c.markAsTouched();
  }

  protected onWebsite(e: Event): void { this.website.set((e.target as HTMLInputElement).value); }

  protected checkEmail(): void { this.freeHint.set(isFreeEmail(this.ctrl('contact.email').value)); }

  protected back(): void { this.goto(this.step() - 1); }

  protected next(): void {
    const i = this.step();
    this.attempted.update(a => a.map((v, j) => (j === i ? true : v)));
    const g = this.group(i);
    if (g.invalid) { g.markAllAsTouched(); this.focusFirstError(); return; }
    this.goto(i + 1);
  }

  protected submit(): void {
    if (this.step() < 2) return this.next();
    this.attempted.set([true, true, true]);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const first = STEP_KEYS.findIndex(k => this.form.get(k)!.invalid);
      if (first !== this.step()) this.step.set(first);
      this.focusFirstError();
      return;
    }
    this.busy.set(true);
    this.outcome.set(null);
    this._Lead.submit('proposal', this.data(), this.website())
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe(r => {
        if (r.status === 'ok') { this.form.reset(); this.step.set(0); this.attempted.set([false, false, false]); return; }
        if (r.status === 'invalid') { this.applyServerErrors(r.errors); return; }
        this.outcome.set(r.status === 'preview' ? 'preview' : r.code);
      });
  }

  private goto(n: number): void {
    this.step.set(n);
    this.outcome.set(null);
    this.save();
    this._Analytics.track('proposal_step', { step: n + 1 });
    setTimeout(() => this._Host.nativeElement.querySelector<HTMLElement>('.form__step-title')?.focus());
  }

  private data(): ILeadData {
    const v = this.form.getRawValue();
    return { ...v.team, ...v.services, ...v.contact };
  }

  private save(): void { this._Lead.saveDraft({ step: this.step(), data: this.data() }); }

  private patch(d: ILeadData): void {
    this.form.patchValue({
      team: { employees: d.employees ?? '', roles: d.roles ?? '', start: d.start ?? '' },
      services: { services: d.services ?? [], message: d.message ?? '' },
      contact: { name: d.name ?? '', email: d.email ?? '', company: d.company ?? '', country: d.country ?? '', phone: d.phone ?? '' },
    }, { emitEvent: false });
  }

  private applyPrefill(): void {
    const p = this._Lead.prefill();
    if (!p) return;
    this._Lead.prefill.set(null);
    if (p.country) this.ctrl('contact.country').setValue(p.country);
    if (p.service) {
      const cur: string[] = this.ctrl('services.services').value;
      if (!cur.includes(p.service)) this.ctrl('services.services').setValue([...cur.filter(x => x !== 'not-sure'), p.service]);
    }
  }

  private applyServerErrors(errors: Record<string, string[]>): void {
    let firstStep = -1;
    for (const [key, msgs] of Object.entries(errors)) {
      const field = key.replace(/^data\./, '').split('.')[0];
      const i = STEP_KEYS.findIndex(s => this.form.get(`${s}.${field}`));
      if (i < 0) continue;
      const c = this.ctrl(`${STEP_KEYS[i]}.${field}`);
      c.setErrors({ server: msgs[0] });
      c.markAsTouched();
      if (firstStep < 0 || i < firstStep) firstStep = i;
    }
    if (firstStep >= 0) this.step.set(firstStep);
    this.focusFirstError();
  }

  private focusFirstError(): void {
    setTimeout(() => this._Host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }
}
