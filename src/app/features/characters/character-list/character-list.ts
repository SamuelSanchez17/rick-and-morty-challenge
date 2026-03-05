import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { RickAndMortyApiService, FavoritesService, TranslationService } from '../../../core/services';
import type { Character, CharacterFilters, ApiInfo } from '../../../core/models';
import { CharacterFiltersComponent } from '../character-filters/character-filters';
import { CharacterCardComponent } from '../character-card/character-card';

@Component({
  selector: 'app-character-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CharacterFiltersComponent, CharacterCardComponent],
  templateUrl: './character-list.html',
  styleUrl: './character-list.scss',
})
export class CharacterListComponent {
  private readonly api = inject(RickAndMortyApiService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);

  protected readonly t = this.translationService.t;
  protected readonly characters = signal<Character[]>([]);
  protected readonly pageInfo = signal<ApiInfo | null>(null);
  protected readonly currentPage = signal(1);
  protected readonly loading = signal(false);
  private readonly errorKey = signal<'notFound' | 'generic' | null>(null);
  private currentFilters: Partial<CharacterFilters> = {};

  protected readonly totalPages = computed(() => this.pageInfo()?.pages ?? 0);
  protected readonly error = computed(() => {
    const key = this.errorKey();
    if (!key) return null;
    return key === 'notFound' ? this.t().noCharactersFound : this.t().errorLoadingCharacters;
  });

  constructor() {
    this.loadCharacters();
  }

  protected onFiltersChanged(filters: Partial<CharacterFilters>): void {
    this.currentFilters = filters;
    this.currentPage.set(1);
    this.loadCharacters();
  }

  protected goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadCharacters();
  }

  protected viewDetail(id: number): void {
    this.router.navigate(['/characters', id]);
  }

  protected toggleFavorite(character: Character): void {
    this.favoritesService.toggleFavorite(character);
  }

  private loadCharacters(): void {
    this.loading.set(true);
    this.errorKey.set(null);

    this.api.getCharacters(this.currentPage(), this.currentFilters).subscribe({
      next: (response) => {
        this.characters.set(response.results);
        this.pageInfo.set(response.info);
        this.loading.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.characters.set([]);
          this.pageInfo.set(null);
          this.errorKey.set('notFound');
        } else {
          this.errorKey.set('generic');
        }
        this.loading.set(false);
      },
    });
  }
}
