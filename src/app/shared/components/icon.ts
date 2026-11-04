import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type IconName = 'arrow' | 'chevron' | 'close' | 'menu' | 'phone' | 'mail' | 'whatsapp' | 'check' | 'plus';

/** One small stroke icon family. Directional icons mirror in RTL via .icon-dir. */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <svg [class]="cls()" [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      @switch (name()) {
        @case ('arrow') { <path d="M4 12h15m-6-6 6 6-6 6" /> }
        @case ('chevron') { <path d="m6 9 6 6 6-6" /> }
        @case ('close') { <path d="M6 6l12 12M18 6 6 18" /> }
        @case ('menu') { <path d="M4 7h16M4 12h16M4 17h16" /> }
        @case ('phone') { <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" /> }
        @case ('mail') { <rect x="3" y="5" width="18" height="14" rx="1" /><path d="m3 7 9 6 9-6" /> }
        @case ('whatsapp') { <path d="M20 11.5A8.5 8.5 0 0 1 7.6 19L4 20l1-3.5A8.5 8.5 0 1 1 20 11.5Z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-1.8-1.8l.8-1-1-2Z" /> }
        @case ('check') { <path d="m5 12 4.5 4.5L19 7" /> }
        @case ('plus') { <path d="M12 5v14M5 12h14" /> }
      }
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(18);
  protected readonly cls = computed(() => `icon${this.name() === 'arrow' ? ' icon-dir' : ''}`);
}
