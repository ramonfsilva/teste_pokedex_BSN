import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { PokemonListItemResponse, PokemonListResponse } from '../models/pokemon-list-response.model';
import { Pokemon } from '../models/pokemon.model';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://pokeapi.co/api/v2';
  private readonly spriteUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

  getPokemons(limit: number, offset: number): Observable<Pokemon[]> {
    const params = new HttpParams()
      .set('limit', limit)
      .set('offset', offset);

    return this.http.get<PokemonListResponse>(`${this.apiUrl}/pokemon`, { params }).pipe(
      map((response) => response.results.map((pokemon) => this.mapPokemon(pokemon))),
    );
  }

  private mapPokemon(pokemon: PokemonListItemResponse): Pokemon {
    const id = this.getPokemonIdFromUrl(pokemon.url);

    return {
      id,
      name: pokemon.name,
      image: `${this.spriteUrl}/${id}.png`,
    };
  }

  private getPokemonIdFromUrl(url: string): number {
    const parts = url.split('/').filter(Boolean);
    const id = Number(parts[parts.length - 1]);

    if (!Number.isFinite(id) || id <= 0) {
      throw new Error(`Invalid Pokemon URL: ${url}`);
    }

    return id;
  }
}
