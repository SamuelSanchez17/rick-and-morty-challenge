import { Injectable, inject, signal, computed } from '@angular/core';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { Character } from '../models';

export interface FavoriteCharacter {
  id: number;
  name: string;
  image: string;
  status: string;
  species: string;
  addedAt: string;
}

const FAVORITES_COLLECTION = 'favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly firebase = inject(FirebaseService);
  private readonly _favorites = signal<Map<number, FavoriteCharacter>>(new Map());
  private unsubscribe: Unsubscribe | null = null;

  readonly favorites = computed(() => [...this._favorites().values()]);
  readonly favoritesCount = computed(() => this._favorites().size);

  constructor() {
    this.listenToFavorites();
  }

  isFavorite(characterId: number): boolean {
    return this._favorites().has(characterId);
  }

  async toggleFavorite(character: Character): Promise<void> {
    if (this.isFavorite(character.id)) {
      await this.removeFavorite(character.id);
    } else {
      await this.addFavorite(character);
    }
  }

  private async addFavorite(character: Character): Promise<void> {
    const favorite: FavoriteCharacter = {
      id: character.id,
      name: character.name,
      image: character.image,
      status: character.status,
      species: character.species,
      addedAt: new Date().toISOString(),
    };

    const docRef = doc(this.firebase.firestore, FAVORITES_COLLECTION, String(character.id));
    await setDoc(docRef, favorite);
  }

  private async removeFavorite(characterId: number): Promise<void> {
    const docRef = doc(this.firebase.firestore, FAVORITES_COLLECTION, String(characterId));
    await deleteDoc(docRef);
  }

  private listenToFavorites(): void {
    const colRef = collection(this.firebase.firestore, FAVORITES_COLLECTION);

    this.unsubscribe = onSnapshot(colRef, (snapshot) => {
      const map = new Map<number, FavoriteCharacter>();
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as FavoriteCharacter;
        map.set(data.id, data);
      });
      this._favorites.set(map);
    });
  }

  destroy(): void {
    this.unsubscribe?.();
  }
}
