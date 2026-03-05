import { Routes } from '@angular/router';

export const characterRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./character-list/character-list').then((m) => m.CharacterListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./character-detail/character-detail').then((m) => m.CharacterDetailComponent),
  },
];
