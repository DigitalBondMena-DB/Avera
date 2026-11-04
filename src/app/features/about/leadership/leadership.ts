import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { PageContext } from '@core/services/page-context.service';
import { Breadcrumbs, DraftBanner, PageHero } from '@shared/components/parts';
import { LEADERS } from '../people.data';

const PATH = '/about/leadership';

@Component({
  selector: 'app-leadership',
  imports: [Breadcrumbs, DraftBanner, PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let d = ctx.d();
    @let l = d.leadership;
    @let lang = ctx.lang();
    @if (draft()) { <app-draft-banner /> }
    <app-breadcrumbs [trail]="trail()" />
    <app-page-hero [title]="l.h1" [lead]="l.intro" />
    <section class="section">
      <div class="container">
        @if (!leaders.length) {
          <p class="notice notice--warn">{{ l.empty }}</p>
        } @else {
          <ul class="leaders">
            @for (p of leaders; track p.id) {
              <li class="leader">
                @if (p.portrait) { <img [src]="p.portrait" alt="" width="480" height="552" loading="lazy" /> }
                <h2 class="h4">{{ p.name[lang] }}</h2>
                <p class="leader__title">{{ p.title[lang] }}</p>
                <p>{{ p.bio[lang] }}</p>
                @if (p.linkedin) { <a [href]="p.linkedin" rel="noopener" target="_blank">LinkedIn</a> }
              </li>
            }
          </ul>
        }
      </div>
    </section>`,
})
export class Leadership {
  protected readonly ctx = inject(PageContext);
  protected readonly leaders = LEADERS;
  protected readonly draft = computed(() => this.ctx._Settings.status(PATH) === 'draft');
  protected readonly trail = computed(() => [{ label: this.ctx.d().nav.aboutAvera, path: '/about' }, { label: this.ctx.d().leadership.h1, path: PATH }]);
  constructor() { effect(() => this.ctx._Seo.set(this.ctx.lang(), PATH, this.ctx.d().leadership.meta, { noindex: this.draft() })); }
}
