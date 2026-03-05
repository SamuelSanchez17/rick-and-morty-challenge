import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FavoritesService, TranslationService } from '../../../core/services';
import { LanguageToggleComponent } from '../language-toggle/language-toggle';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, LanguageToggleComponent],
  template: `
    <nav class="navbar" role="navigation" [attr.aria-label]="t().navLabel">
      <a class="navbar__brand" routerLink="/">
        <span class="navbar__logo" aria-hidden="true">🧪</span>
        Rick & Morty
      </a>

      <div class="navbar__right">
        <ul class="navbar__links">
          <li>
            <a routerLink="/characters" routerLinkActive="active" [attr.aria-label]="t().viewCharactersLabel">
              {{ t().navCharacters }}
            </a>
          </li>
          <li>
            <a routerLink="/favorites" routerLinkActive="active" [attr.aria-label]="t().viewFavoritesLabel">
              {{ t().navFavorites }}
              @if (favoritesCount() > 0) {
                <span class="navbar__badge" [attr.aria-label]="favoritesCount() + ' ' + t().favoritesCountLabel">
                  {{ favoritesCount() }}
                </span>
              }
            </a>
          </li>
        </ul>
        <app-language-toggle />
      </div>
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

      @media (max-width: 600px) {
        flex-wrap: wrap;
        height: auto;
        padding: 0.5rem 1rem;
        gap: 0.25rem;
      }
    }

    .navbar__brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: #00d4aa;
      text-decoration: none;

      @media (max-width: 600px) {
        font-size: 1.1rem;
      }
    }

    .navbar__logo {
      font-size: 1.5rem;
    }

    .navbar__right {
      display: flex;
      align-items: center;
      gap: 1.25rem;

      @media (max-width: 600px) {
        width: 100%;
        justify-content: space-between;
        gap: 0.5rem;
      }
    }

    .navbar__links {
      display: flex;
      list-style: none;
      gap: 1rem;
      margin: 0;
      padding: 0;

      @media (max-width: 600px) {
        gap: 0.25rem;
      }

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

        @media (max-width: 600px) {
          padding: 0.4rem 0.6rem;
          font-size: 0.85rem;
        }

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
  private readonly translationService = inject(TranslationService);

  protected readonly favoritesCount = this.favoritesService.favoritesCount;
  protected readonly t = this.translationService.t;
}
