import { Injectable, signal, computed, effect } from '@angular/core';

export type Language = 'es' | 'en';

const ES = {
  navCharacters: 'Personajes',
  navFavorites: 'Favoritos',
  navLabel: 'Navegación principal',
  viewCharactersLabel: 'Ver personajes',
  viewFavoritesLabel: 'Ver favoritos',
  favoritesCountLabel: 'favoritos',

  charactersTitle: 'Personajes',
  loadingCharacters: 'Cargando personajes...',
  noCharactersFound: 'No se encontraron personajes con esos filtros.',
  errorLoadingCharacters: 'Error al cargar personajes. Intenta de nuevo.',
  page: 'Página',
  of: 'de',
  previousPage: '← Anterior',
  nextPage: 'Siguiente →',
  previousPageLabel: 'Página anterior',
  nextPageLabel: 'Página siguiente',
  paginationLabel: 'Paginación de personajes',

  filterName: 'Nombre',
  filterStatus: 'Estado',
  filterSpecies: 'Especie',
  filterGender: 'Género',
  filterNamePlaceholder: 'Buscar por nombre...',
  filterSpeciesPlaceholder: 'Human, Alien...',
  filterAll: 'Todos',
  filterAlive: 'Vivo',
  filterDead: 'Muerto',
  filterUnknown: 'Desconocido',
  filterFemale: 'Femenino',
  filterMale: 'Masculino',
  filterGenderless: 'Sin género',
  filterSearch: 'Buscar',
  filterClear: 'Limpiar',
  filterAriaLabel: 'Filtrar personajes',

  statusAlive: 'Vivo',
  statusDead: 'Muerto',
  statusUnknown: 'Desconocido',
  genderFemale: 'Femenino',
  genderMale: 'Masculino',
  genderGenderless: 'Sin género',
  genderUnknown: 'Desconocido',
  viewDetail: 'Ver detalle',
  viewDetailOf: 'Ver detalle de',
  addToFavorites: 'Agregar a favoritos',
  removeFromFavorites: 'Quitar de favoritos',

  loadingCharacter: 'Cargando personaje...',
  backToList: '← Volver',
  backToListLabel: 'Volver a la lista de personajes',
  detailSpecies: 'Especie',
  detailType: 'Tipo',
  detailGender: 'Género',
  detailOrigin: 'Origen',
  detailLocation: 'Ubicación',
  episodes: 'Episodios',
  characterNotFound: 'No se encontró el personaje.',
  backToCharacters: 'Volver a la lista',

  favoritesTitle: 'Mis Favoritos',
  noFavorites: 'Aún no tienes personajes favoritos.',
  exploreFavorites: 'Explora el',
  characterDirectory: 'directorio de personajes',
  andAddFavorites: 'y agrega tus favoritos.',
  viewArrow: 'Ver →',
};

export type Translations = Record<keyof typeof ES, string>;

const EN: Translations = {
  navCharacters: 'Characters',
  navFavorites: 'Favorites',
  navLabel: 'Main navigation',
  viewCharactersLabel: 'View characters',
  viewFavoritesLabel: 'View favorites',
  favoritesCountLabel: 'favorites',

  charactersTitle: 'Characters',
  loadingCharacters: 'Loading characters...',
  noCharactersFound: 'No characters found with those filters.',
  errorLoadingCharacters: 'Error loading characters. Try again.',
  page: 'Page',
  of: 'of',
  previousPage: '← Previous',
  nextPage: 'Next →',
  previousPageLabel: 'Previous page',
  nextPageLabel: 'Next page',
  paginationLabel: 'Character pagination',

  filterName: 'Name',
  filterStatus: 'Status',
  filterSpecies: 'Species',
  filterGender: 'Gender',
  filterNamePlaceholder: 'Search by name...',
  filterSpeciesPlaceholder: 'Human, Alien...',
  filterAll: 'All',
  filterAlive: 'Alive',
  filterDead: 'Dead',
  filterUnknown: 'Unknown',
  filterFemale: 'Female',
  filterMale: 'Male',
  filterGenderless: 'Genderless',
  filterSearch: 'Search',
  filterClear: 'Clear',
  filterAriaLabel: 'Filter characters',

  statusAlive: 'Alive',
  statusDead: 'Dead',
  statusUnknown: 'Unknown',
  genderFemale: 'Female',
  genderMale: 'Male',
  genderGenderless: 'Genderless',
  genderUnknown: 'Unknown',
  viewDetail: 'View detail',
  viewDetailOf: 'View detail of',
  addToFavorites: 'Add to favorites',
  removeFromFavorites: 'Remove from favorites',

  loadingCharacter: 'Loading character...',
  backToList: '← Back',
  backToListLabel: 'Back to character list',
  detailSpecies: 'Species',
  detailType: 'Type',
  detailGender: 'Gender',
  detailOrigin: 'Origin',
  detailLocation: 'Location',
  episodes: 'Episodes',
  characterNotFound: 'Character not found.',
  backToCharacters: 'Back to list',

  favoritesTitle: 'My Favorites',
  noFavorites: 'You have no favorite characters yet.',
  exploreFavorites: 'Explore the',
  characterDirectory: 'character directory',
  andAddFavorites: 'and add your favorites.',
  viewArrow: 'View →',
};

const TRANSLATIONS: Record<Language, Translations> = { es: ES, en: EN };

@Injectable({ providedIn: 'root' })
export class TranslationService {
  readonly lang = signal<Language>(this.getInitialLang());
  readonly t = computed(() => TRANSLATIONS[this.lang()]);

  constructor() {
    effect(() => {
      document.documentElement.lang = this.lang();
    });
  }

  toggleLanguage(): void {
    const next = this.lang() === 'es' ? 'en' : 'es';
    this.lang.set(next);
    localStorage.setItem('app-lang', next);
  }

  private getInitialLang(): Language {
    const stored = localStorage.getItem('app-lang');
    return stored === 'en' ? 'en' : 'es';
  }
}
