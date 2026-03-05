import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top';


@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NavbarComponent, ScrollToTopComponent],
  template: `
    <app-navbar />
    <main class="layout__content">
      <router-outlet />
    </main>
    <app-scroll-to-top />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #16213e;
    }

    .layout__content {
      flex: 1;
      padding: 1.5rem;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;

      @media (max-width: 600px) {
        padding: 1rem 0.75rem;
      }
    }
  `,
})
export class LayoutComponent {}
