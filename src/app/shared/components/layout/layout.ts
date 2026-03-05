import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';


@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <main class="layout__content">
      <router-outlet />
    </main>
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
    }
  `,
})
export class LayoutComponent {}
