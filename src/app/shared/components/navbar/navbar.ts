import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FavoritesService } from '../../../core/services';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar" role="navigation" aria-label="Navegación principal">
      <a class="navbar__brand" routerLink="/">
        <span class="navbar__logo" aria-hidden="true">🧪</span>
        Rick & Morty
      </a>

      <ul class="navbar__links">
        <li>
          <a routerLink="/characters" routerLinkActive="active" aria-label="Ver personajes">
            Personajes
          </a>
        </li>
        <li>
          <a routerLink="/favorites" routerLinkActive="active" aria-label="Ver favoritos">
            Favoritos
            @if (favoritesCount() > 0) {
              <span class="navbar__badge" aria-label="{{ favoritesCount() }} favoritos">
                {{ favoritesCount() }}
              </span>
            }
          </a>
        </li>
      </ul>
    </nav>
  `,
  styles: `
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      height: 64px;
      background: #1a1a2e;
      color: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .navbar__brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: #00d4aa;
      text-decoration: none;
    }

    .navbar__logo {
      font-size: 1.5rem;
    }

    .navbar__links {
      display: flex;
      list-style: none;
      gap: 1rem;
      margin: 0;
      padding: 0;

      a {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        color: #b0b0c0;
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-weight: 500;
        transition: color 0.2s, background 0.2s;

        &:hover,
        &:focus-visible {
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
        }

        &.active {
          color: #00d4aa;
          background: rgba(0, 212, 170, 0.1);
        }
      }
    }

    .navbar__badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 10px;
      background: #e74c6f;
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
    }
  `,
})
export class NavbarComponent {
  private readonly favoritesService = inject(FavoritesService);
  protected readonly favoritesCount = this.favoritesService.favoritesCount;
}
