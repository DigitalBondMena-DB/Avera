import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { MobileBar } from './components/mobile-bar/mobile-bar';
import { Consent } from './components/consent/consent';
import { LeadDrawer } from './components/lead-drawer/lead-drawer';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, Footer, MobileBar, Consent, LeadDrawer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-header />
    <main id="main" tabindex="-1"><router-outlet /></main>
    <app-footer />
    <app-mobile-bar />
    <app-consent />
    <app-lead-drawer />`,
})
export class MainLayout {}
