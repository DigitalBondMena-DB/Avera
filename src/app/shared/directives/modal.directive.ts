import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, OnDestroy, PLATFORM_ID, afterNextRender, inject, output } from '@angular/core';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Put on a dialog element rendered with @if. While it exists: focus is moved inside and trapped,
 * Escape emits (escape), the page behind does not scroll, and focus returns to the opener on destroy.
 */
@Directive({ selector: '[appModal]' })
export class ModalDirective implements OnDestroy {
  readonly escape = output<void>({ alias: 'appModalEscape' });
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly doc = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private previous: HTMLElement | null = null;
  private readonly onKey = (e: KeyboardEvent) => this.handleKey(e);

  constructor() {
    afterNextRender(() => {
      this.previous = this.doc.activeElement as HTMLElement | null;
      const root = this.doc.documentElement;
      const scrollbar = (this.doc.defaultView?.innerWidth ?? 0) - root.clientWidth;
      root.classList.add('is-locked');
      root.style.setProperty('--scrollbar', `${scrollbar}px`);
      this.doc.addEventListener('keydown', this.onKey);
      const first = this.el.querySelector<HTMLElement>('[data-autofocus]') ?? this.el.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    });
  }

  private handleKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') { e.stopPropagation(); this.escape.emit(); return; }
    if (e.key !== 'Tab') return;
    const items = Array.from(this.el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(x => x.offsetParent !== null);
    if (!items.length) return;
    const a = items[0], z = items[items.length - 1];
    if (e.shiftKey && this.doc.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && this.doc.activeElement === z) { e.preventDefault(); a.focus(); }
  }

  ngOnDestroy(): void {
    if (!this.browser) return;
    this.doc.removeEventListener('keydown', this.onKey);
    const root = this.doc.documentElement;
    root.classList.remove('is-locked'); // a modal opened in the same tick re-locks after render
    root.style.removeProperty('--scrollbar');
    const prev = this.previous;
    setTimeout(() => {
      if (this.doc.querySelector('[role="dialog"][aria-modal="true"]')) return; // another modal took over
      if (prev && this.doc.contains(prev)) prev.focus();
    });
  }
}
