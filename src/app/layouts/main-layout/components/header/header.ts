import { ChangeDetectionStrategy, Component, DOCUMENT, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { PageContext } from '@core/services/page-context.service';
import { GULF_SLUGS, SERVICE_GROUPS, SERVICE_SLUGS } from '@core/constants/routes';
import { Icon } from '@shared/components/icon';
import { LangSwitch } from '@shared/components/lang-switch';
import { ProposalButton, ConsultationButton } from '@shared/components/cta-buttons';
import { ModalDirective } from '@shared/directives/modal.directive';

type MenuKey = 'services' | 'markets' | 'about' | null;

@Component({
  selector: 'app-header',
  imports: [RouterLink, Icon, LangSwitch, ProposalButton, ConsultationButton, ModalDirective],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closeMenuFromKey()', '(document:mousedown)': 'onDocClick($event)' },
})
export class Header {
  protected readonly ctx = inject(PageContext);
  private readonly _Router = inject(Router);
  private readonly _Document = inject(DOCUMENT);
  private readonly navRef = viewChild<ElementRef<HTMLElement>>('nav');

  protected readonly menu = signal<MenuKey>(null);
  protected readonly mobile = signal(false);
  protected readonly section = signal<string | null>(null);
  protected readonly url = signal('');

  protected readonly groups = SERVICE_GROUPS;
  protected readonly services = computed(() => SERVICE_SLUGS.map(s => this.ctx.d().services[s]));
  protected readonly gulf = GULF_SLUGS;
  protected readonly aboutLinks = computed(() => {
    const n = this.ctx.d().nav, s = this.ctx._Settings;
    return [
      { path: '/about', label: n.aboutAvera },
      { path: '/trust', label: n.trust },
      ...(s.isPublic('/about/leadership') ? [{ path: '/about/leadership', label: n.leadership }] : []),
      ...(s.isPublic('/about/clients') ? [{ path: '/about/clients', label: n.clients }] : []),
    ];
  });
  protected readonly showInsights = computed(() => this.ctx._Settings.isPublic('/insights'));

  constructor() {
    this.url.set(this._Router.url);
    this._Router.events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed()).subscribe(() => {
      this.url.set(this._Router.url);
      this.menu.set(null);
      this.mobile.set(false);
    });
    effect(() => this._Document.documentElement.toggleAttribute('data-menu-open', this.mobile()));
  }

  protected current(p: string): 'page' | null { return this.url().split(/[?#]/)[0] === this.ctx.L(p) ? 'page' : null; }
  protected inSection(...ps: string[]): boolean { return ps.some(p => this.url().startsWith(this.ctx.L(p))); }
  protected toggle(k: Exclude<MenuKey, null>): void { this.menu.update(m => (m === k ? null : k)); }
  protected toggleSection(k: string): void { this.section.update(s => (s === k ? null : k)); }

  closeMenuFromKey(): void {
    const k = this.menu();
    if (!k) return;
    this.menu.set(null);
    this._Document.getElementById(`menu-${k}-btn`)?.focus();
  }
  onDocClick(e: MouseEvent): void {
    if (this.menu() && !this.navRef()?.nativeElement.contains(e.target as Node)) this.menu.set(null);
  }
  protected onFocusOut(e: FocusEvent): void {
    if (!this.navRef()?.nativeElement.contains(e.relatedTarget as Node)) this.menu.set(null);
  }
  protected closeMobileFromCta(e: Event): void {
    if ((e.target as HTMLElement).closest('[data-cta]')) this.mobile.set(false);
  }
}
