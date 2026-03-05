import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FavoritesService, TranslationService } from '../../../core/services';

@Component({
  selector: 'app-favorites-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="favorites">
      <h1 class="favorites__title">{{ t().favoritesTitle }}</h1>

      @if (favorites().length === 0) {
        <div class="favorites__empty">
          <p>{{ t().noFavorites }}</p>
          <p>{{ t().exploreFavorites }} <a (click)="goToCharacters()" tabindex="0" role="link">{{ t().characterDirectory }}</a> {{ t().andAddFavorites }}</p>
        </div>
      } @else {
        <div class="favorites__grid" role="list">
          @for (fav of favorites(); track fav.id) {
            <article class="fav-card" role="listitem">
              <img
                [src]="fav.image"
                [alt]="'Foto de ' + fav.name"
                class="fav-card__image"
                width="120"
                height="120"
                loading="lazy"
              />
              <div class="fav-card__body">
                <h3 class="fav-card__name">{{ fav.name }}</h3>
                <p class="fav-card__meta">{{ fav.species }} · {{ fav.status }}</p>
              </div>
              <button
                class="fav-card__action"
                (click)="goToDetail(fav.id)"
                [attr.aria-label]="t().viewDetailOf + ' ' + fav.name"
              >
                {{ t().viewArrow }}
              </button>
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: `
    .favorites {
      &__title {
        font-size: 1.75rem;
        color: #fff;
        margin: 0 0 1.5rem;
      }

      &__empty {
        text-align: center;
        padding: 3rem;
        color: #a0a0b8;

        a {
          color: #00d4aa;
          cursor: pointer;
          text-decoration: underline;

          &:focus-visible {
            outline: 2px solid #00d4aa;
            outline-offset: 2px;
            border-radius: 4px;
          }
        }
      }

      &__grid {
        display: grid;
        gap: 1rem;
      }
    }

    .fav-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: #1a1a2e;
      border-radius: 12px;
      transition: background 0.2s;

      &:hover {
        background: #1e1e36;
      }

      &__image {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }

      &__body {
        flex: 1;
      }

      &__name {
        margin: 0;
        color: #fff;
        font-size: 1rem;
      }

      &__meta {
        margin: 0.2rem 0 0;
        color: #a0a0b8;
        font-size: 0.85rem;
      }

      &__action {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 8px;
        background: #0f3460;
        color: #00d4aa;
        font-weight: 600;
        cursor: pointer;
        font-size: 0.85rem;

        &:hover {
          background: #143b6e;
        }

        &:focus-visible {
          outline: 2px solid #00d4aa;
          outline-offset: 2px;
        }
      }
    }
  `,
})
export class FavoritesListComponent {
  private readonly favoritesService = inject(FavoritesService);
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);

  protected readonly favorites = this.favoritesService.favorites;
  protected readonly t = this.translationService.t;

  protected goToCharacters(): void {
    this.router.navigate(['/characters']);
  }

  protected goToDetail(id: number): void {
    this.router.navigate(['/characters', id]);
  }
}
