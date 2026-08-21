import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  InfiniteScrollCustomEvent,
  SegmentCustomEvent,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';
import { forkJoin } from 'rxjs';

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
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonImg,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar,
    RouterLink,
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

  private readonly pokemonService = inject(PokemonService);
  protected readonly favoritesService = inject(FavoritesService);
  private readonly pageSize = 20;
  private readonly currentOffset = signal(0);

  constructor() {
    addIcons({ heart, heartOutline });
  }

  ngOnInit(): void {
    this.loadPokemons();
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
    if (this.selectedView() !== 'all') {
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
      this.loadFavoritePokemons();
    }
  }

  protected toggleFavorite(event: Event, pokemonId: number): void {
    event.preventDefault();
    event.stopPropagation();
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

    forkJoin(favoriteIds.map((id) => this.pokemonService.getPokemonById(id))).subscribe({
      next: (favoriteDetails) => {
        this.favoritePokemons.set(favoriteDetails.map((pokemon) => this.toPokemon(pokemon)));
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
}
