import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, EMPTY, debounceTime, switchMap, catchError } from 'rxjs';
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
  private readonly route = inject(ActivatedRoute);
  private readonly translationService = inject(TranslationService);

  protected readonly t = this.translationService.t;
  protected readonly characters = signal<Character[]>([]);
  protected readonly pageInfo = signal<ApiInfo | null>(null);
  protected readonly currentPage = signal(1);
  protected readonly loading = signal(false);
  private readonly errorKey = signal<'notFound' | 'generic' | null>(null);
  protected currentFilters: Partial<CharacterFilters> = {};

  private readonly loadTrigger$ = new Subject<void>();

  protected readonly totalPages = computed(() => this.pageInfo()?.pages ?? 0);
  protected readonly error = computed(() => {
    const key = this.errorKey();
    if (!key) return null;
    return key === 'notFound' ? this.t().noCharactersFound : this.t().errorLoadingCharacters;
  });

  constructor() {
    const params = this.route.snapshot.queryParamMap;
    const page = Number(params.get('page')) || 1;
    const filters: Partial<CharacterFilters> = {};
    if (params.get('name')) filters.name = params.get('name')!;
    if (params.get('status')) filters.status = params.get('status') as CharacterFilters['status'];
    if (params.get('species')) filters.species = params.get('species')!;
    if (params.get('gender')) filters.gender = params.get('gender') as CharacterFilters['gender'];

    this.currentPage.set(page);
    this.currentFilters = filters;

    this.loadTrigger$
      .pipe(
        debounceTime(300),
        switchMap(() => {
          this.loading.set(true);
          this.errorKey.set(null);
          return this.api.getCharacters(this.currentPage(), this.currentFilters).pipe(
            catchError((err) => {
              if (err.status === 404) {
                this.characters.set([]);
                this.pageInfo.set(null);
                this.errorKey.set('notFound');
              } else {
                this.errorKey.set('generic');
              }
              this.loading.set(false);
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((response) => {
        this.characters.set(response.results);
        this.pageInfo.set(response.info);
        this.loading.set(false);
      });

    this.loadTrigger$.next();
  }

  protected onFiltersChanged(filters: Partial<CharacterFilters>): void {
    this.currentFilters = filters;
    this.currentPage.set(1);
    this.syncQueryParams();
    this.loadTrigger$.next();
  }

  protected goToPage(page: number): void {
    this.currentPage.set(page);
    this.syncQueryParams();
    this.loadTrigger$.next();
  }

  protected viewDetail(id: number): void {
    this.router.navigate(['/characters', id]);
  }

  protected toggleFavorite(character: Character): void {
    this.favoritesService.toggleFavorite(character);
  }

  private syncQueryParams(): void {
    const queryParams: Record<string, string | number> = {};
    const page = this.currentPage();
    if (page > 1) queryParams['page'] = page;
    if (this.currentFilters.name) queryParams['name'] = this.currentFilters.name;
    if (this.currentFilters.status) queryParams['status'] = this.currentFilters.status;
    if (this.currentFilters.species) queryParams['species'] = this.currentFilters.species;
    if (this.currentFilters.gender) queryParams['gender'] = this.currentFilters.gender;

    this.router.navigate([], { queryParams, replaceUrl: true });
  }
}
