# Directorio Rick & Morty — Challenge

<div align="center">

**Aplicación Angular que consume la Rick and Morty API para explorar personajes con sistema de favoritos persistidos en Firestore.**

[![Angular](https://img.shields.io/badge/Angular-21.2-DD0031?style=for-the-badge&logo=angular)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-12.10-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com)
[![Deploy](https://img.shields.io/badge/Live-enacment--rick--morty.web.app-00d4aa?style=for-the-badge&logo=googlechrome)](https://enacment-rick-morty.web.app?)

</div>

---

## 🎯 Reto Elegido y Alcance

**Reto**: Construir una app web con Angular que consuma una API pública, permita filtrar/navegar datos y persista favoritos en Firebase.

**Alcance implementado**:
- Listado paginado de personajes con filtros combinables (nombre, estado, especie, género)
- Vista de detalle por personaje con episodios asociados
- Sistema de favoritos con persistencia en tiempo real (Firestore)
- Internacionalización completa ES/EN con persistencia de preferencia
- Diseño responsive (mobile-first breakpoints)
- Accesibilidad WCAG AA (contraste, focus, ARIA, roles)

**Supuestos**:
- Se eligió Firestore sin autenticación (colección pública) dado que el alcance no requiere login/usuarios.
- La API de Rick and Morty no requiere API key ni rate limiting agresivo.
- Se priorizó el "toque diferenciador" en favoritos + i18n sobre features opcionales como comparación de personajes.

---

## 🏗️ Arquitectura y Estructura

```
┌──────────────────────────────────────────────────────────┐
│            CAPA DE PRESENTACIÓN (Angular 21)             │
│  Standalone Components · Signals · OnPush · Lazy Routes  │
└─────────────────────┬────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
  ┌───────────┐ ┌──────────┐ ┌───────────┐
  │ Features  │ │  Shared  │ │   Core    │
  │ (lazy)    │ │  Layout  │ │ Services  │
  └───────────┘ └──────────┘ └─────┬─────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              ┌──────────┐  ┌──────────┐  ┌────────────┐
              │ Rick &   │  │ Firestore│  │Translation │
              │ Morty API│  │ (CRUD +  │  │ Service    │
              │ (HTTP)   │  │ Realtime)│  │ (Signals)  │
              └──────────┘  └──────────┘  └────────────┘
```

```
src/app/
├── app.ts                          → Componente raíz (<router-outlet />)
├── app.config.ts                   → provideRouter, provideHttpClient
├── app.routes.ts                   → Layout wrapper + lazy routes
├── core/
│   ├── models/                     → Interfaces: Character, Episode, Location, ApiResponse
│   └── services/
│       ├── firebase.service.ts     → Inicializa FirebaseApp + Firestore
│       ├── rick-and-morty-api.service.ts → HttpClient wrapper para la API
│       ├── favorites.service.ts    → CRUD Firestore + signals reactivos + onSnapshot
│       └── translation.service.ts  → i18n ES/EN con signals + localStorage
├── features/
│   ├── characters/                 → Lazy-loaded: list, detail, card, filters
│   └── favorites/                  → Lazy-loaded: favorites list
├── shared/
│   └── components/
│       ├── layout/                 → Shell con navbar + router-outlet
│       ├── navbar/                 → Navegación + badge de favoritos
│       ├── language-toggle/        → Selector ES/EN con animación portal
│       └── scroll-to-top/          → Botón flotante con scroll listener fuera de NgZone
└── environments/
    ├── environment.ts              → Config producción
    └── environment.development.ts  → Config desarrollo
```

---

## 📦 Modelo de Datos

### API Externa (Rick and Morty API)

| Endpoint | Uso |
|---|---|
| `GET /character?name=&status=&species=&gender=&page=` | Listado paginado con filtros |
| `GET /character/:id` | Detalle de personaje |
| `GET /episode/:id` | Episodio individual |
| `GET /episode/:ids` | Múltiples episodios (batch) |

### Firestore — Colección `favorites`

```
favorites/{characterId}
├── id: number
├── name: string
├── image: string
├── status: string
├── species: string
└── addedAt: string (ISO 8601)
```

- **Índices**: Ninguno adicional requerido (consultas simples por colección).
- **Reglas**: Lectura y escritura abiertas con expiración temporal (ver sección de Seguridad).

---

## ⚙️ Estado y Navegación

### Estrategia de Estado
- **Signals** (`signal()`) para estado local de cada componente (characters, loading, error, page info)
- **`computed()`** para estado derivado (totalPages, isFavorite, translated labels, status/gender labels)
- **Firestore `onSnapshot`** para sincronización en tiempo real de favoritos → alimenta un `signal<Map>` en `FavoritesService`
- **Query params** para persistencia de navegación: la página actual y filtros se sincronizan con la URL (`?page=10&name=rick&status=Alive`). Navegación con el botón atrás regresa al mismo estado, no al inicio más cercano.

### Routing con Lazy Loading

| Ruta | Componente | Carga |
|---|---|---|
| `/` | redirect → `/characters` | — |
| `/characters` | `CharacterListComponent` | `loadChildren` (lazy) |
| `/characters/:id` | `CharacterDetailComponent` | `loadComponent` (lazy) |
| `/favorites` | `FavoritesListComponent` | `loadChildren` (lazy) |
| `**` | redirect → `/characters` | — |

Todas las rutas están envueltas en `LayoutComponent` (navbar + outlet) cargado en el route config raíz.

---

## 🧠 Decisiones Técnicas

1. **Firebase JS SDK directo (sin `@angular/fire`)** — Se evitó la abstracción de `@angular/fire` para reducir bundle size (~60kB menos) y mantener control directo sobre `onSnapshot`/`setDoc`/`deleteDoc`. El SDK nativo es suficiente para las operaciones CRUD simples requeridas.

2. **Signals en lugar de stores externos** — Angular 21 ofrece signals nativos que, combinados con `computed()`, cubren toda la reactividad necesaria sin añadir NgRx/NGXS. Esto reduce boilerplate y mantiene el estado co-localizado con los componentes que lo consumen.

3. **i18n artesanal con `TranslationService`** — En lugar de `@ngx-translate` o Angular i18n (que requiere múltiples builds), se implementó un servicio basado en signals con ~70 keys. Cambio de idioma instantáneo sin recarga, persistido en `localStorage`, y actualiza `document.documentElement.lang` vía `effect()`.

4. **Scroll listener fuera de NgZone** — El `ScrollToTopComponent` registra el event listener con `NgZone.runOutsideAngular()` + `{ passive: true }` para evitar change detection innecesario en cada evento de scroll. Solo actualiza el signal cuando el estado de visibilidad cambia.

5. **Debounce en filtros de texto** — Los inputs de nombre y especie emiten con `debounceTime(300)` vía `merge` + `takeUntilDestroyed`, evitando llamadas excesivas a la API mientras el usuario escribe. Los selects (status/gender) requieren click en "Buscar" dado que su cambio es intencional.

---

## 📈 Escalabilidad y Mantenimiento

| Aspecto | Implementación actual | Crecimiento futuro |
|---|---|---|
| **Separación de capas** | Core (services/models) → Features (lazy) → Shared (UI) | Nuevos features (locations, episodes) se añaden como módulos lazy independientes |
| **Servicios SRP** | 4 servicios, cada uno con responsabilidad única | Nuevos servicios se inyectan con `providedIn: 'root'` |
| **Tipado estricto** | `strict: true`, 0 ocurrencias de `any`, barrel exports con `export type` | Interfaces se extienden sin romper contratos |
| **i18n** | Diccionario centralizado en `TranslationService` | Agregar idioma = añadir objeto + key al `Record<Language, Translations>` |
| **Estado** | Signals locales + computed | Migrable a signal store (NgRx SignalStore) si la complejidad crece |
| **Migrabilidad** | Firebase JS SDK desacoplado en `FirebaseService` | Cambiar backend = reemplazar un servicio, los componentes no se enteran |

---

## � Retos Resueltos durante el Desarrollo

### Problema: Rate Limiting 429 (Too Many Requests) en la API de Rick & Morty

**Síntoma**: Al navegar rápidamente entre páginas (esp. a partir de la página 10+), la API devolvía errores `429 Too Many Requests` y luego errores CORS (`status: 0`).

**Root cause**: 
1. Sin throttling, cada clic de paginación disparaba una petición HTTP independiente
2. Al hacer clic 5 veces en 1 segundo → 5 peticiones simultáneas a la API
3. La API de Rick & Morty tiene un rate limit implícito que se gatilla
4. En respuestas de error, la API omite cabeceras CORS, causando que el navegador reporte `status: 0`

**Solución implementada** (3 capas):
1. **Debounce + switchMap** en `CharacterListComponent`: 300ms de espera + `switchMap` cancela la petición anterior si llega una nueva. Clics rápidos se colapsan en una sola petición.
2. **In-memory cache + Retry inteligente** en `RickAndMortyApiService`:
   - Cache con TTL 5 minutos (datos de Rick & Morty son estáticos)
   - Retry automático solo para `429` y `status: 0` con backoff exponencial (1s, 2s, 4s)
   - Otros errores (`404`, `500`) propagan inmediatamente sin reintentar
3. **Paginación virtual**: Combina 2 páginas API en 1 página UI (40 caracteres/página). Reduce de 42 a ~21 páginas totales → menos navegación general.

**Resultado**: Navegación fluida incluso en mobile o conexiones lentas; sin errores 429 en uso normal.

---

## �🔐 Seguridad y Validaciones

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 4, 4);
    }
  }
}
```

**Estado actual**: Reglas abiertas con expiración temporal. Aceptable para demo/evaluación dado que:
- No hay datos sensibles (solo favoritos: id, nombre, imagen)
- No hay autenticación en el scope del reto
- La expiración previene abuso a largo plazo

**Mejora para producción**:
```javascript
match /favorites/{docId} {
  allow read: if true;
  allow write: if request.resource.data.keys().hasAll(['id','name','image','status','species','addedAt'])
               && request.resource.data.id is int;
}
```

### Manejo de Secretos

- Variables de entorno de Firebase en archivos `environment.ts` / `environment.development.ts`
- Archivos `.example` con placeholders incluidos en el repo para onboarding
- Archivos reales excluidos de Git vía `.gitignore`
- **Nota**: Las API keys de Firebase son semi-públicas por diseño (restringidas por dominio en la consola de Firebase)

### Validaciones de Input

- Filtros sanitizados por Angular (binding seguro, sin `innerHTML`)
- IDs de ruta validados implícitamente por la API (respuesta 404 → error state)
- Formularios reactivos con tipado `nonNullable` (no hay valores `null` involuntarios)

---

## ⚡ Rendimiento

| Técnica | Implementación |
|---|---|
| **Paginación virtual** | Cada "página UI" combina 2 páginas consecutivas de la API (40 personajes/página). Reduce de 42 a ~21 páginas totales sin afectar UX. |
| **Caché en memoria** | In-memory cache con TTL de 5 minutos. Los datos de Rick & Morty son estáticos, así que se cachean para eliminar re-requests innecesarios al navegar atrás o cambiar filtros. |
| **Retry inteligente** | Reintenta automáticamente `429` (Too Many Requests) y `status: 0` (CORS transitorio) con backoff exponencial (1s → 2s → 4s). Los errores reales (`404`, `500`, etc.) fallan inmediatamente. |
| **Lazy loading** | Todas las feature routes cargan bajo demanda (`loadChildren` / `loadComponent`) |
| **OnPush** | Todos los componentes usan `ChangeDetectionStrategy.OnPush` |
| **`runOutsideAngular`** | Scroll listener del botón scroll-to-top opera fuera de NgZone |
| **Debounce** | Inputs de texto con `debounceTime(300ms)` para reducir llamadas HTTP |
| **Batch de episodios** | Detalle agrupa IDs y hace una sola llamada `GET /episode/1,2,3` en vez de N individuales |
| **Passive listeners** | Scroll event listener con `{ passive: true }` |
| **Image lazy loading** | `loading="lazy"` en imágenes de cards y favoritos |

---

## ♿ Accesibilidad

| Criterio WCAG AA | Implementación |
|---|---|
| **Contraste de color** | Todos los textos sobre fondos oscuros verificados con ratio ≥ 4.5:1 (colores ajustados: `#9090aa`, `#8aaa9e`, `#f06088`) |
| **Navegación por teclado** | `:focus-visible` global con outline verde `#00d4aa` + offset; todos los botones e inputs enfocables |
| **Roles ARIA** | `role="navigation"`, `role="search"`, `role="status"`, `role="alert"`, `role="list"`, `role="listitem"` |
| **Atributos ARIA** | `aria-label` aria-label en todos los elementos interactivos sin texto visible |
| **Idioma del documento** | `<html lang>` actualizado dinámicamente via `effect()` según idioma seleccionado |
| **Estados comunicados** | Loading, error y vacío anunciados a lectores de pantalla vía `aria-live` y `role="alert"` |

---

## 🤖 Uso de IA

### Herramientas utilizadas
- **GitHub Copilot (Claude)** como asistente de desarrollo en VS Code

### Dónde y por qué se usó

| Área | Uso de IA | Justificación |
|---|---|---|
| **Scaffolding de componentes** | Generación inicial de estructura de componentes con signals y OnPush | Acelerar boilerplate repetitivo manteniendo consistencia en patrones |
| **Sistema de i18n** | Creación del `TranslationService` y diccionarios ES/EN | Implementar ~70 claves de traducción consistentes en dos idiomas |
| **Estilos responsive** | Generación de media queries y breakpoints | Aplicar breakpoints coherentes en 6+ componentes simultáneamente |
| **Accesibilidad** | Inserción de atributos ARIA, roles y aria-live | Asegurar cobertura completa sin omitir elementos interactivos |
| **Error handlers** | try/catch en Firestore, callbacks de error en subscribe | Cubrir paths de error que son fáciles de olvidar en desarrollo |

### Resumen de prompts tipo
- *"Implementar filtrado en tiempo real con debounce para evitar llamadas excesivas a la API y toggle de idioma ES/EN sin necesidad de recargar la vista."*
- *"Agregar componente scroll-to-top: botón flotante visible al hacer scroll, con animación suave y diseño consistente con la paleta de colores existente en la app."*
- *"Refactorizar estilos responsive: identifica componentes descuadrados en móvil y aplicar correcciones con flexbox/grid sin alterar la funcionalidad existente."*

### Qué acepté vs. qué reescribí
- **Acepté**: La estructura base del `TranslationService` con signals y el diccionario inicial de claves ES/EN.
- **Reescribí**: Los media queries responsive generados inicialmente usaban px fijos; los migré a rem y ajusté breakpoints según el comportamiento real en móvil.
- **Rechacé**: Una sugerencia de usar NgRx para manejo de estado ya que signals nativos cubren el alcance sin añadir complejidad innecesaria.


### Riesgos detectados y mitigación

| Riesgo | Ejemplo concreto | Mitigación |
|---|---|---|
| **Performance** | El scroll listener generado se ejecutaba dentro de NgZone, disparando change detection en cada evento scroll | Se movió a `runOutsideAngular()` con `{ passive: true }` y se actualizó el signal solo al cambiar el estado de visibilidad |
| **Seguridad** | Las reglas de Firestore generadas eran `allow read, write: if true` sin restricción alguna | Se añadió expiración temporal (`timestamp.date(2026, 4, 4)`) y se documentó la mejora con validación de campos para producción |
| **Sesgos de IA** | Tendencia a sugerir soluciones sobre-abstraídas (NgRx, `@angular/fire`, wrappers genéricos) cuando signals nativos y el SDK directo eran suficientes | Se rechazaron sistemáticamente las abstracciones innecesarias; criterio: si no aporta valor medible al scope actual, no se añade |
| **Código sin entender** | Atributos ARIA genéricos (`aria-label="button"`) que no aportaban contexto real al lector de pantalla | Revisión manual de cada cambio; se personalizaron los labels (ej: `aria-label="Ir a detalle de Rick Sanchez"`) |
| **Inconsistencia de estilo** | Mezcla de comillas dobles/simples y formateo inconsistente en código generado | Prettier + EditorConfig como fuente de verdad; instrucciones persistentes en `.github/copilot-instructions.md` |
| **Dependencia en generación** | Riesgo de usar IA como muleta y no entender los patrones subyacentes | IA como acelerador, no como reemplazo. Patrones fundamentales (signals, lazy loading, DI) se dominan independientemente |

### Lecciones aprendidas y siguientes mejoras
- **La IA acelera, no reemplaza**: El mayor valor estuvo en tareas repetitivas (74 claves i18n, ARIA en 15+ elementos, media queries en 6 componentes). Las decisiones de arquitectura (signals vs NgRx, SDK directo vs `@angular/fire`) requirieron criterio humano.
- **Validar siempre en contexto real**: Código que "se ve correcto" en el editor puede fallar en móvil o en lectores de pantalla. Cada cambio generado se probó manualmente en viewport real y con herramientas AXE.
- **Instrucciones persistentes mejoran la calidad**: Configurar `.github/copilot-instructions.md` con las convenciones del proyecto (OnPush, signals, no `any`, standalone implícito) redujo significativamente las correcciones manuales post-generación.
- **Siguiente mejora**: Incorporar tests unitarios generados con IA como punto de partida, revisando cobertura de edge cases y evitando tests que solo validen la implementación obvia (happy path).

---

## 🚀 Instalación y Ejecución

### Prerrequisitos
- **Node.js** ≥ 20
- **npm** ≥ 11
- **Angular CLI** ≥ 21 (`npm i -g @angular/cli`)
- **Firebase CLI** (solo para deploy: `npm i -g firebase-tools`)

### Setup

```bash
# 1. Clonar el repositorio
git clone https://github.com/SamuelSanchez17/rick-and-morty-challenge.git
cd rick-and-morty-challenge

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp src/app/environments/environment.example.ts src/app/environments/environment.ts
cp src/app/environments/environment.development.example.ts src/app/environments/environment.development.ts
# Editar ambos archivos con tus credenciales de Firebase

# 4. Ejecutar en desarrollo
npm start
# → http://localhost:4200
```

### Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo (http://localhost:4200) |
| `npm run build` | Build de producción |
| `npm test` | Ejecutar tests (Vitest) |
| `firebase deploy` | Desplegar en Firebase Hosting |

### Despliegue

```bash
npm run build
firebase login
firebase deploy
# → https://enacment-rick-morty.web.app
```

---

## ⚠️ Limitaciones y Siguientes Pasos

### Limitaciones actuales
- **Sin autenticación**: Los favoritos son globales (cualquier visitante ve/modifica los mismos favoritos). No hay usuario individual.
- **Sin tests unitarios**: Vitest está configurado pero no se incluyeron specs por alcance de tiempo. Es el gap técnico más notable.
- **Bundle size**: El initial bundle (~529kB) supera ligeramente el budget de 500kB, principalmente por el Firebase JS SDK.
- **Sin SSR**: La app es SPA client-side only. El SEO inicial es limitado.

### Siguientes pasos
1. **Tests unitarios** — Cubrir servicios (`FavoritesService`, `TranslationService`, `RickAndMortyApiService`) y componentes clave
2. **Firebase Auth** — Añadir autenticación para favoritos por usuario + reglas Firestore por UID
3. **`NgOptimizedImage`** — Reemplazar `<img [src]>` por `ngSrc` para optimización automática de imágenes
4. **Virtual scroll** — Implementar `@angular/cdk/scrolling` si se elimina la paginación a favor de scroll infinito
5. **CI/CD** — GitHub Actions para build + test + deploy automático a Firebase en cada push a la rama `main`
6. **PWA** — Service worker para funcionamiento offline y carga instantánea en revisitas

---

## 👨‍💻 Autor
**Samuel Sánchez Guzmán**
Tipo: Prueba técnica

