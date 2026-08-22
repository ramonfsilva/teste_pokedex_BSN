import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  IonContent,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonLabel,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  InfiniteScrollCustomEvent,
  SegmentCustomEvent,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { catchError, forkJoin, of } from 'rxjs';

import { PokemonCardComponent } from '../components/pokemon-card/pokemon-card.component';
import { PokemonDetail } from '../models/pokemon-detail.model';
import { Pokemon } from '../models/pokemon.model';
import { FavoritesService } from '../services/favorites.service';
import { PokemonService } from '../services/pokemon.service';

type HomeView = 'all' | 'favorites';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonLabel,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar,
    PokemonCardComponent,
  ],
})
export class HomePage implements OnInit {
  @ViewChild('content') private readonly content?: IonContent;

  protected readonly pokemons = signal<Pokemon[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly totalPokemon = signal(0);
  protected readonly isLoadingMore = signal(false);
  protected readonly hasMorePokemon = computed(() => this.pokemons().length < this.totalPokemon());
  protected readonly selectedView = signal<HomeView>('all');
  protected readonly favoritePokemons = signal<Pokemon[]>([]);
  protected readonly isLoadingFavorites = signal(false);
  protected readonly favoritesError = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly searchResult = signal<Pokemon | null>(null);
  protected readonly isSearching = signal(false);
  protected readonly searchError = signal<string | null>(null);
  protected readonly hasSearchExecuted = signal(false);
  protected readonly isSearchActive = computed(() => this.hasSearchExecuted());

  private readonly pokemonService = inject(PokemonService);
  protected readonly favoritesService = inject(FavoritesService);
  private readonly pageSize = 20;
  private readonly currentOffset = signal(0);

  ngOnInit(): void {
    this.loadPokemons();
  }

  ionViewWillEnter(): void {
    if (this.selectedView() === 'favorites') {
      this.loadFavoritePokemons();
    }
  }

  private loadPokemons(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.pokemonService.getPokemons(this.pageSize, 0).subscribe({
      next: (pokemonPage) => {
        this.pokemons.set(pokemonPage.results);
        this.totalPokemon.set(pokemonPage.count);
        this.currentOffset.set(pokemonPage.results.length);
        this.isLoading.set(false);
        this.fillScrollableAreaIfNeeded();
      },
      error: () => {
        this.errorMessage.set('Unable to load Pokemon. Please try again later.');
        this.isLoading.set(false);
      },
    });
  }

  protected loadMorePokemons(event: InfiniteScrollCustomEvent): void {
    if (this.selectedView() !== 'all' || this.isSearchActive()) {
      event.target.complete();
      return;
    }

    if (this.isLoadingMore() || !this.hasMorePokemon()) {
      event.target.complete();
      return;
    }

    this.loadNextPokemonPage(() => event.target.complete());
  }

  protected selectView(event: SegmentCustomEvent): void {
    const selectedValue = event.detail.value === 'favorites' ? 'favorites' : 'all';

    this.selectedView.set(selectedValue);

    if (selectedValue === 'favorites') {
      this.clearSearch();
      this.loadFavoritePokemons();
    }
  }

  protected updateSearchQuery(event: Event): void {
    const searchEvent = event as CustomEvent<{ value?: string | null }>;
    const query = searchEvent.detail.value ?? '';

    this.searchQuery.set(query);
    this.searchResult.set(null);
    this.searchError.set(null);
    this.isSearching.set(false);
    this.hasSearchExecuted.set(false);

    if (!query.trim()) {
      this.clearSearch();
    }
  }

  protected searchPokemon(): void {
    const query = this.normalizeSearchQuery(this.searchQuery());

    if (!query) {
      this.clearSearch();
      return;
    }

    if (/^\d+$/.test(query)) {
      this.searchQuery.set(query);
      this.searchResult.set(null);
      this.searchError.set('Search by Pokémon name.');
      this.isSearching.set(false);
      this.hasSearchExecuted.set(true);
      return;
    }

    this.searchQuery.set(query);
    this.searchResult.set(null);
    this.searchError.set(null);
    this.isSearching.set(true);
    this.hasSearchExecuted.set(true);

    this.pokemonService.getPokemon(query).subscribe({
      next: (pokemon) => {
        this.searchResult.set(this.toPokemon(pokemon));
        this.isSearching.set(false);
      },
      error: (error: unknown) => {
        this.searchError.set(error instanceof HttpErrorResponse && error.status === 404
          ? 'No Pokemon found.'
          : 'Unable to search Pokemon. Please try again later.');
        this.isSearching.set(false);
      },
    });
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
    this.searchResult.set(null);
    this.searchError.set(null);
    this.isSearching.set(false);
    this.hasSearchExecuted.set(false);
  }

  protected toggleFavorite(pokemonId: number): void {
    this.favoritesService.toggle(pokemonId);

    if (this.selectedView() === 'favorites') {
      this.favoritePokemons.update((favorites) => favorites.filter((pokemon) => pokemon.id !== pokemonId));
    }
  }

  private loadNextPokemonPage(onComplete?: () => void, checkScrollable = false): void {
    if (this.isLoadingMore() || !this.hasMorePokemon()) {
      onComplete?.();
      return;
    }

    this.isLoadingMore.set(true);
    this.errorMessage.set(null);

    this.pokemonService.getPokemons(this.pageSize, this.currentOffset()).subscribe({
      next: (pokemonPage) => {
        this.pokemons.update((current) => [...current, ...pokemonPage.results]);
        this.totalPokemon.set(pokemonPage.count);
        this.currentOffset.update((offset) => offset + pokemonPage.results.length);
        this.isLoadingMore.set(false);
        onComplete?.();

        if (checkScrollable && pokemonPage.results.length > 0) {
          this.fillScrollableAreaIfNeeded();
        }
      },
      error: () => {
        this.isLoadingMore.set(false);
        onComplete?.();
      },
    });
  }

  private fillScrollableAreaIfNeeded(): void {
    requestAnimationFrame(async () => {
      const scrollElement = await this.content?.getScrollElement();

      if (!scrollElement || this.isLoadingMore() || !this.hasMorePokemon()) {
        return;
      }

      if (scrollElement.scrollHeight <= scrollElement.clientHeight) {
        this.loadNextPokemonPage(undefined, true);
      }
    });
  }

  private loadFavoritePokemons(): void {
    const favoriteIds = this.favoritesService.favorites();

    this.favoritesError.set(null);

    if (favoriteIds.length === 0) {
      this.favoritePokemons.set([]);
      this.isLoadingFavorites.set(false);
      return;
    }

    this.isLoadingFavorites.set(true);

    forkJoin(favoriteIds.map((id) => this.pokemonService.getPokemonById(id).pipe(
      catchError(() => of(null)),
    ))).subscribe({
      next: (favoriteDetails) => {
        const loadedFavorites = favoriteDetails
          .filter((pokemon): pokemon is PokemonDetail => pokemon !== null)
          .map((pokemon) => this.toPokemon(pokemon));

        this.favoritePokemons.set(loadedFavorites);
        this.favoritesError.set(loadedFavorites.length === 0 ? 'Unable to load favorite Pokemon. Please try again later.' : null);
        this.isLoadingFavorites.set(false);
      },
      error: () => {
        this.favoritesError.set('Unable to load favorite Pokemon. Please try again later.');
        this.isLoadingFavorites.set(false);
      },
    });
  }

  private toPokemon(pokemon: PokemonDetail): Pokemon {
    return {
      id: pokemon.id,
      name: pokemon.name,
      image: pokemon.image,
    };
  }

  private normalizeSearchQuery(value: string): string {
    return value.trim().toLowerCase();
  }
}
