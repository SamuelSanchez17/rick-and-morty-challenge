
# Rick & Morty Challenge – Enacment

## Proyecto

Aplicación Angular que consume la Rick and Morty API para listar, filtrar y ver detalle de personajes, con sistema de favoritos persistidos en Firestore.

- **URL de despliegue**: https://enacment-rick-morty.web.app
- **Firebase project**: `enacment-rick-morty`

## Stack Técnico

| Tecnología | Versión |
|---|---|
| Angular | 21.2 |
| TypeScript | 5.9.2 |
| Firebase SDK | 12.10 |
| Vitest | 4.0.8 |
| SCSS | (inline language en angular.json) |
| Node package manager | npm 11.6.2 |

## Comandos

```bash
npm start          # ng serve → http://localhost:4200
npm run build      # ng build (producción por defecto)
npm test           # ng test (Vitest)
firebase deploy    # despliega a https://enacment-rick-morty.web.app
```

## Arquitectura

```
src/app/
  app.ts                    → Componente raíz (inline template: <router-outlet />)
  app.config.ts             → provideRouter, provideHttpClient
  app.routes.ts             → Layout wrapper + lazy routes
  core/
    models/                 → Interfaces: Character, Episode, Location, ApiResponse
      index.ts              → barrel re-exports (usa `export type`)
    services/
      firebase.service.ts   → Inicializa FirebaseApp + Firestore
      rick-and-morty-api.service.ts → HttpClient wrapper para la API
      favorites.service.ts  → CRUD Firestore + signals reactivos
      index.ts              → barrel re-exports
  features/
    characters/
      characters.routes.ts  → lazy routes: '' → list, ':id' → detail
      character-card/       → Tarjeta de personaje (inline template)
      character-detail/     → Vista detalle (template + scss externos)
      character-filters/    → Formulario reactivo de filtros (inline template)
      character-list/       → Listado paginado (template + scss externos)
    favorites/
      favorites.routes.ts   → lazy route: '' → favorites-list
      favorites-list/       → Lista de favoritos (inline template)
  shared/
    components/
      layout/               → Layout con navbar + <router-outlet>
      navbar/               → Navegación con badge de favoritos
  environments/
    environment.ts          → Config producción (Firebase + API URL)
    environment.development.ts → Config desarrollo
```

## API Externa

- Base URL: `https://rickandmortyapi.com/api`
- Endpoints usados: `/character`, `/character/:id`, `/episode/:id`, `/episode/:ids`
- Filtros: `name`, `status`, `species`, `gender`, `page`

## Firebase

- Hosting: `dist/rick-and-morty-challenge-enacment/browser` con SPA rewrite
- Firestore: colección `favorites` con documentos por ID de personaje
- Reglas: lectura/escritura abierta hasta 2026-04-04

## Decisiones Clave

- "Mi toque diferenciador": Favoritos con persistencia en Firestore usando Firebase JS SDK directo (no @angular/fire)
- Todos los componentes son standalone (default en Angular 21, NO poner `standalone: true`)
- Signals para estado local, `computed()` para estado derivado
- `ChangeDetectionStrategy.OnPush` en todos los componentes
- Todas las rutas de features usan lazy loading (`loadChildren` / `loadComponent`)
- Formularios reactivos (no template-driven)
- `inject()` en vez de constructor injection

## Convenciones de Código

### TypeScript
- Strict mode + `isolatedModules` (usar `export type` para re-exportar tipos)
- Evitar `any`, usar `unknown` si el tipo es incierto
- Preferir inferencia de tipos cuando es obvio

### Angular
- NO usar `@HostBinding` / `@HostListener` → usar `host` en el decorador
- NO usar `ngClass` / `ngStyle` → usar bindings `[class]` / `[style]`
- Usar `input()` y `output()` en vez de decoradores `@Input` / `@Output`
- Control flow nativo: `@if`, `@for`, `@switch` (no directivas estructurales)
- Templates inline para componentes pequeños
- Templates externos con rutas relativas al archivo TS

### Accesibilidad
- Debe pasar todas las verificaciones AXE
- Cumplir WCAG AA: focus management, contraste, atributos ARIA
- `aria-label`, `aria-live`, `role` aplicados correctamente

### Formato
- Prettier: `printWidth: 100`, `singleQuote: true`, parser `angular` para HTML
- EditorConfig: indent 2 espacios, UTF-8, single quotes en TS
