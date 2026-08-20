import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly storageKey = 'pokemon-favorites';
  private readonly favoriteIds = signal<number[]>(this.loadFavorites());

  readonly favorites = this.favoriteIds.asReadonly();

  add(id: number): void {
    if (this.isFavorite(id)) {
      return;
    }

    this.favoriteIds.update((favorites) => [...favorites, id]);
    this.saveFavorites();
  }

  remove(id: number): void {
    this.favoriteIds.update((favorites) => favorites.filter((favoriteId) => favoriteId !== id));
    this.saveFavorites();
  }

  toggle(id: number): void {
    if (this.isFavorite(id)) {
      this.remove(id);
      return;
    }

    this.add(id);
  }

  isFavorite(id: number): boolean {
    return this.favoriteIds().includes(id);
  }

  private loadFavorites(): number[] {
    const savedFavorites = localStorage.getItem(this.storageKey);

    if (!savedFavorites) {
      return [];
    }

    try {
      const parsedFavorites: unknown = JSON.parse(savedFavorites);

      if (!Array.isArray(parsedFavorites)) {
        return [];
      }

      return [...new Set(parsedFavorites.filter((id): id is number => Number.isInteger(id) && id > 0))];
    } catch {
      return [];
    }
  }

  private saveFavorites(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.favoriteIds()));
  }
}
