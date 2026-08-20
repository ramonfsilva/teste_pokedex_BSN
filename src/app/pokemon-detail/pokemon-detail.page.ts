import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { PokemonDetail } from '../models/pokemon-detail.model';
import { FavoritesService } from '../services/favorites.service';
import { PokemonService } from '../services/pokemon.service';

@Component({
  selector: 'app-pokemon-detail',
  templateUrl: 'pokemon-detail.page.html',
  styleUrls: ['pokemon-detail.page.scss'],
  imports: [
    IonBackButton,
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonImg,
    IonItem,
    IonLabel,
    IonList,
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar,
  ],
})
export class PokemonDetailPage implements OnInit {
  protected readonly pokemon = signal<PokemonDetail | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly pokemonService = inject(PokemonService);
  protected readonly favoritesService = inject(FavoritesService);

  ngOnInit(): void {
    const id = this.getPokemonIdFromRoute();

    if (id === null) {
      this.errorMessage.set('Invalid Pokemon ID.');
      this.isLoading.set(false);
      return;
    }

    this.loadPokemon(id);
  }

  private getPokemonIdFromRoute(): number | null {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    return Number.isInteger(id) && id > 0 ? id : null;
  }

  private loadPokemon(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.pokemonService.getPokemonById(id).subscribe({
      next: (pokemon) => {
        this.pokemon.set(pokemon);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load Pokemon details. Please try again later.');
        this.isLoading.set(false);
      },
    });
  }

  protected toggleFavorite(id: number): void {
    this.favoritesService.toggle(id);
  }
}
