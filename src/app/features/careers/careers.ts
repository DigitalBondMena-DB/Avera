import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { PageContext } from '@core/services/page-context.service';
import { Photo } from '@shared/components/photo';
import { Breadcrumbs } from '@shared/components/parts';

/** CV upload stays disabled until secure storage exists; candidates register interest by email. */
@Component({
  selector: 'app-careers',
  imports: [Photo, Breadcrumbs],
  templateUrl: './careers.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Careers {
  protected readonly ctx = inject(PageContext);
  protected readonly tab = signal(0);
  protected readonly email = computed(() => this.ctx._Settings.business().careersEmail);
  protected readonly trail = computed(() => [{ label: this.ctx.d().nav.careers, path: '/careers' }]);
  constructor() { effect(() => this.ctx._Seo.set(this.ctx.lang(), '/careers', this.ctx.d().careers.meta)); }

  /** WAI-ARIA tabs: arrow keys move between tabs (direction-aware). */
  protected onKey(e: KeyboardEvent, list: HTMLElement): void {
    const rtl = this.ctx.lang() === 'ar';
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight', back = rtl ? 'ArrowRight' : 'ArrowLeft';
    if (e.key !== fwd && e.key !== back) return;
    e.preventDefault();
    const n = (this.tab() + 1) % 2;
    this.tab.set(n);
    list.querySelectorAll<HTMLElement>('[role="tab"]')[n]?.focus();
  }
}
