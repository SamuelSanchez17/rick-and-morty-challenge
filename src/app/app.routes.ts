import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'characters', pathMatch: 'full' },
      {
        path: 'characters',
        loadChildren: () =>
          import('./features/characters/characters.routes').then((m) => m.characterRoutes),
      },
      {
        path: 'favorites',
        loadChildren: () =>
          import('./features/favorites/favorites.routes').then((m) => m.favoritesRoutes),
      },
    ],
  },
  { path: '**', redirectTo: 'characters' },
];
