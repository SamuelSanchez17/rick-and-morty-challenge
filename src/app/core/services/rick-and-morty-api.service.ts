import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Character, CharacterFilters, Episode, Location } from '../models';

@Injectable({ providedIn: 'root' })
export class RickAndMortyApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.rickAndMortyApiUrl;

  getCharacters(page = 1, filters?: Partial<CharacterFilters>): Observable<ApiResponse<Character>> {
    let params = new HttpParams().set('page', page);

    if (filters) {
      if (filters.name) params = params.set('name', filters.name);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.species) params = params.set('species', filters.species);
      if (filters.gender) params = params.set('gender', filters.gender);
    }

    return this.http.get<ApiResponse<Character>>(`${this.baseUrl}/character`, { params });
  }

  getCharacter(id: number): Observable<Character> {
    return this.http.get<Character>(`${this.baseUrl}/character/${id}`);
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
}
