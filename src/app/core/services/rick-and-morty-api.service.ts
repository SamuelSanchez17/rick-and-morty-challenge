import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, timer, throwError, forkJoin } from 'rxjs';
import { tap, retry, map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse, Character, CharacterFilters, Episode, Location } from '../models';

const API_PAGES_PER_PAGE = 2;

@Injectable({ providedIn: 'root' })
export class RickAndMortyApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.rickAndMortyApiUrl;
  private readonly cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly cacheTtl = 5 * 60 * 1000; // 5 minutes

  getCharacters(page = 1, filters?: Partial<CharacterFilters>): Observable<ApiResponse<Character>> {
    const firstApiPage = (page - 1) * API_PAGES_PER_PAGE + 1;

    const buildParams = (apiPage: number): HttpParams => {
      let params = new HttpParams().set('page', apiPage);
      if (filters) {
        if (filters.name) params = params.set('name', filters.name);
        if (filters.status) params = params.set('status', filters.status);
        if (filters.species) params = params.set('species', filters.species);
        if (filters.gender) params = params.set('gender', filters.gender);
      }
      return params;
    };

    const url = `${this.baseUrl}/character`;
    const cacheKey = `${url}?virtual_page=${page}&${buildParams(firstApiPage).toString()}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
      return of(cached.data as ApiResponse<Character>);
    }

    const first$ = this.cachedGet<ApiResponse<Character>>(
      `${url}?${buildParams(firstApiPage).toString()}`,
      url,
      buildParams(firstApiPage),
    );

    const secondApiPage = firstApiPage + 1;
    const second$ = this.cachedGet<ApiResponse<Character>>(
      `${url}?${buildParams(secondApiPage).toString()}`,
      url,
      buildParams(secondApiPage),
    ).pipe(catchError(() => of(null)));

    return forkJoin([first$, second$]).pipe(
      map(([firstRes, secondRes]) => this.mergePages(firstRes, secondRes)),
      tap((data) => this.cache.set(cacheKey, { data, timestamp: Date.now() })),
    );
  }

  private mergePages(
    first: ApiResponse<Character>,
    second: ApiResponse<Character> | null,
  ): ApiResponse<Character> {
    const totalApiPages = first.info.pages;
    const virtualPages = Math.ceil(totalApiPages / API_PAGES_PER_PAGE);
    return {
      info: {
        count: first.info.count,
        pages: virtualPages,
        next: second?.info.next ? 'has-next' : null,
        prev: first.info.prev ? 'has-prev' : null,
      },
      results: [...first.results, ...(second?.results ?? [])],
    };
  }

  getCharacter(id: number): Observable<Character> {
    const url = `${this.baseUrl}/character/${id}`;
    return this.cachedGet<Character>(url, url);
  }

  getEpisode(id: number): Observable<Episode> {
    return this.http.get<Episode>(`${this.baseUrl}/episode/${id}`);
  }

  getEpisodes(ids: number[]): Observable<Episode[]> {
    return this.http.get<Episode[]>(`${this.baseUrl}/episode/${ids.join(',')}`);
  }

  getLocation(id: number): Observable<Location> {
    return this.http.get<Location>(`${this.baseUrl}/location/${id}`);
  }

  private cachedGet<T>(cacheKey: string, url: string, params?: HttpParams): Observable<T> {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
      return of(cached.data as T);
    }

    return this.http.get<T>(url, { params }).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => {
          // status 0 = network/CORS error (API dropped CORS headers on transient failure)
          // status 429 = rate limited
          if (error.status === 0 || error.status === 429) {
            return timer(1000 * Math.pow(2, retryCount));
          }
          return throwError(() => error);
        },
      }),
      tap((data) => this.cache.set(cacheKey, { data, timestamp: Date.now() })),
    );
  }
}
