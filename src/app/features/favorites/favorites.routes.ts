import { Routes } from '@angular/router';

export const favoritesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./favorites-list/favorites-list').then((m) => m.FavoritesListComponent),
  },
];
