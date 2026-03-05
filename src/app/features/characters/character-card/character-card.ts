import { Component, ChangeDetectionStrategy, input, output, inject, computed } from '@angular/core';
import type { Character } from '../../../core/models';
import { FavoritesService, TranslationService } from '../../../core/services';

@Component({
  selector: 'app-character-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card" [class.card--dead]="character().status === 'Dead'">
      <div class="card__image-wrapper">
        <img
          [src]="character().image"
          [alt]="'Foto de ' + character().name"
          class="card__image"
          width="300"
          height="300"
          loading="lazy"
        />
        <span class="card__status" [class]="'card__status--' + character().status.toLowerCase()">
          {{ statusLabel() }}
        </span>
      </div>

      <div class="card__body">
        <h3 class="card__name">{{ character().name }}</h3>
        <p class="card__meta">{{ character().species }} — {{ genderLabel() }}</p>
        <p class="card__location">📍 {{ character().location.name }}</p>

        <div class="card__actions">
          <button class="btn btn--detail" (click)="viewDetail.emit(character().id)" [attr.aria-label]="t().viewDetailOf + ' ' + character().name">
            {{ t().viewDetail }}
          </button>
          <button
            class="btn btn--fav"
            [class.btn--fav-active]="isFav()"
            (click)="toggleFav.emit(character())"
            [attr.aria-label]="isFav() ? t().removeFromFavorites : t().addToFavorites"
            [attr.aria-pressed]="isFav()"
          >
            {{ isFav() ? '❤️' : '🤍' }}
          </button>
        </div>
      </div>
    </article>
  `,
  styles: `
    .card {
      background: #1a1a2e;
      border-radius: 16px;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      }
    }

    .card--dead {
      opacity: 0.75;
    }

    .card__image-wrapper {
      position: relative;
    }

    .card__image {
      width: 100%;
      height: auto;
      display: block;
      aspect-ratio: 1;
      object-fit: cover;
    }

    .card__status {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 0.25rem 0.6rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .card__status--alive {
      background: #00d4aa;
      color: #1a1a2e;
    }

    .card__status--dead {
      background: #e74c6f;
      color: #fff;
    }

    .card__status--unknown {
      background: #6a6a8a;
      color: #fff;
    }

    .card__body {
      padding: 1rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .card__name {
      margin: 0 0 0.25rem;
      font-size: 1.1rem;
      color: #fff;
    }

    .card__meta {
      margin: 0;
      font-size: 0.85rem;
      color: #a0a0b8;
    }

    .card__location {
      margin: 0.5rem 0 0;
      font-size: 0.8rem;
      color: #6a8a80;
    }

    .card__actions {
      display: flex;
      gap: 0.5rem;
      margin-top: auto;
      padding-top: 0.75rem;
    }

    .btn {
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: opacity 0.2s;

      &:focus-visible {
        outline: 2px solid #00d4aa;
        outline-offset: 2px;
      }
    }

    .btn--detail {
      flex: 1;
      padding: 0.5rem;
      background: #0f3460;
      color: #00d4aa;

      &:hover {
        background: #143b6e;
      }
    }

    .btn--fav {
      padding: 0.5rem 0.75rem;
      background: #2a2a4a;
      font-size: 1.1rem;
      line-height: 1;

      &:hover {
        background: #3a3a5a;
      }
    }

    .btn--fav-active {
      background: rgba(231, 76, 111, 0.2);
    }
  `,
})
export class CharacterCardComponent {
  readonly character = input.required<Character>();
  readonly viewDetail = output<number>();
  readonly toggleFav = output<Character>();

  private readonly favoritesService = inject(FavoritesService);
  private readonly translationService = inject(TranslationService);
  protected readonly t = this.translationService.t;

  protected readonly isFav = computed(() => this.favoritesService.isFavorite(this.character().id));

  protected readonly statusLabel = computed(() => {
    const t = this.t();
    const map: Record<string, string> = { Alive: t.statusAlive, Dead: t.statusDead, unknown: t.statusUnknown };
    return map[this.character().status] ?? this.character().status;
  });

  protected readonly genderLabel = computed(() => {
    const t = this.t();
    const map: Record<string, string> = { Female: t.genderFemale, Male: t.genderMale, Genderless: t.genderGenderless, unknown: t.genderUnknown };
    return map[this.character().gender] ?? this.character().gender;
  });
}
