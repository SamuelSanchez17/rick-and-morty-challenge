import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RickAndMortyApiService, FavoritesService, TranslationService } from '../../../core/services';
import type { Character, Episode } from '../../../core/models';

@Component({
  selector: 'app-character-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './character-detail.html',
  styleUrl: './character-detail.scss',
})
export class CharacterDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly api = inject(RickAndMortyApiService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly translationService = inject(TranslationService);

  protected readonly t = this.translationService.t;

  protected readonly character = signal<Character | null>(null);
  protected readonly episodes = signal<Episode[]>([]);
  protected readonly loading = signal(true);

  protected readonly isFavorite = computed(() => {
    const char = this.character();
    return char ? this.favoritesService.isFavorite(char.id) : false;
  });

  protected readonly locationId = computed(() => {
    const url = this.character()?.location.url;
    return url ? Number(url.split('/').pop()) : null;
  });

  protected readonly originId = computed(() => {
    const url = this.character()?.origin.url;
    return url ? Number(url.split('/').pop()) : null;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCharacter(id);
  }

  protected toggleFavorite(): void {
    const char = this.character();
    if (char) {
      this.favoritesService.toggleFavorite(char);
    }
  }

  protected goBack(): void {
    this.location.back();
  }

  protected onImageError(event: Event): void {
    const img = event.target;
    if (!(img instanceof HTMLImageElement)) return;
    img.onerror = null;
    img.src = '/notFound.jpeg';
  }

  private loadCharacter(id: number): void {
    this.api.getCharacter(id).subscribe({
      next: (character) => {
        this.character.set(character);
        this.loading.set(false);
        this.loadEpisodes(character.episode);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private loadEpisodes(episodeUrls: string[]): void {
    const ids = episodeUrls.map((url) => Number(url.split('/').pop()));
    const errorHandler = { error: (err: unknown) => console.error('Failed to load episodes:', err) };
    if (ids.length === 1) {
      this.api.getEpisode(ids[0]).subscribe({ next: (ep) => this.episodes.set([ep]), ...errorHandler });
    } else if (ids.length > 1) {
      this.api.getEpisodes(ids).subscribe({ next: (eps) => this.episodes.set(eps), ...errorHandler });
    }
  }
}
