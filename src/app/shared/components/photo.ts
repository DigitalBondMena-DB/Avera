import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import type { ImageKey } from '@core/models/content.model';

/** Fills its positioned container. The LCP image gets `priority`; everything else lazy-loads. */
@Component({
  selector: 'app-photo',
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<img class="photo" [ngSrc]="name()" fill [priority]="priority()" [sizes]="sizes()" [alt]="alt()" [style.object-position]="position()" />`,
})
export class Photo {
  readonly name = input.required<ImageKey>();
  readonly alt = input.required<string>();
  readonly sizes = input('100vw');
  readonly priority = input(false);
  readonly position = input<string | undefined>(undefined);
}
