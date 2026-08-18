import { Component, inject, OnInit, signal } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonImg,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { Pokemon } from '../models/pokemon.model';
import { PokemonService } from '../services/pokemon.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonImg,
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar,
  ],
})
export class HomePage implements OnInit {
  protected readonly pokemons = signal<Pokemon[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  private readonly pokemonService = inject(PokemonService);
  private readonly pageSize = 20;
  private readonly offset = 0;

  ngOnInit(): void {
    this.loadPokemons();
  }

  private loadPokemons(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.pokemonService.getPokemons(this.pageSize, this.offset).subscribe({
      next: (pokemons) => {
        this.pokemons.set(pokemons);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load Pokemon. Please try again later.');
        this.isLoading.set(false);
      },
    });
  }
}
