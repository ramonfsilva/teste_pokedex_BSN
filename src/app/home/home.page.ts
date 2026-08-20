import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
  InfiniteScrollCustomEvent,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { Pokemon } from '../models/pokemon.model';
import { FavoritesService } from '../services/favorites.service';
import { PokemonService } from '../services/pokemon.service';

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
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar,
    RouterLink,
  ],
})
export class HomePage implements OnInit {
  protected readonly pokemons = signal<Pokemon[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly totalPokemon = signal(0);
  protected readonly isLoadingMore = signal(false);
  protected readonly hasMorePokemon = computed(() => this.pokemons().length < this.totalPokemon());

  private readonly pokemonService = inject(PokemonService);
  protected readonly favoritesService = inject(FavoritesService);
  private readonly pageSize = 20;
  private readonly currentOffset = signal(0);

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
      },
      error: () => {
        this.errorMessage.set('Unable to load Pokemon. Please try again later.');
        this.isLoading.set(false);
      },
    });
  }

  protected loadMorePokemons(event: InfiniteScrollCustomEvent): void {
    if (this.isLoadingMore() || !this.hasMorePokemon()) {
      event.target.complete();
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
        event.target.complete();
      },
      error: () => {
        this.errorMessage.set('Unable to load more Pokemon. Please try again later.');
        this.isLoadingMore.set(false);
        event.target.complete();
      },
    });
  }

  protected toggleFavorite(event: Event, pokemonId: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggle(pokemonId);
  }
}
