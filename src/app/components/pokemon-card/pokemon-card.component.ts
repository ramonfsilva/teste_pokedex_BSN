import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonIcon, IonImg } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';

import { Pokemon } from '../../models/pokemon.model';

@Component({
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.scss'],
  imports: [IonButton, IonCard, IonCardContent, IonIcon, IonImg, RouterLink],
})
export class PokemonCardComponent {
  readonly pokemon = input.required<Pokemon>();
  readonly isFavorite = input(false);
  readonly favoriteToggle = output<number>();

  constructor() {
    addIcons({ heart, heartOutline });
  }

  protected toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoriteToggle.emit(this.pokemon().id);
  }
}
