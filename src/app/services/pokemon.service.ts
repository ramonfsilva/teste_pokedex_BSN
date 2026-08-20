import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { PokemonDetail, PokemonDetailResponse, PokemonDetailStatResponse } from '../models/pokemon-detail.model';
import { PokemonListItemResponse, PokemonListResponse } from '../models/pokemon-list-response.model';
import { Pokemon, PokemonPage } from '../models/pokemon.model';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://pokeapi.co/api/v2';
  private readonly spriteUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

  getPokemons(limit: number, offset: number): Observable<PokemonPage> {
    const params = new HttpParams()
      .set('limit', limit)
      .set('offset', offset);

    return this.http.get<PokemonListResponse>(`${this.apiUrl}/pokemon`, { params }).pipe(
      map((response) => ({
        count: response.count,
        results: response.results.map((pokemon) => this.mapPokemon(pokemon)),
      })),
    );
  }

  getPokemonById(id: number): Observable<PokemonDetail> {
    return this.http.get<PokemonDetailResponse>(`${this.apiUrl}/pokemon/${id}`).pipe(
      map((pokemon) => this.mapPokemonDetail(pokemon)),
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

  private mapPokemonDetail(pokemon: PokemonDetailResponse): PokemonDetail {
    return {
      id: pokemon.id,
      name: pokemon.name,
      image: pokemon.sprites.front_default ?? `${this.spriteUrl}/${pokemon.id}.png`,
      types: pokemon.types.map((item) => item.type.name),
      height: pokemon.height,
      weight: pokemon.weight,
      baseExperience: pokemon.base_experience,
      abilities: pokemon.abilities.map((item) => item.ability.name),
      hp: this.getStatValue(pokemon.stats, 'hp'),
      attack: this.getStatValue(pokemon.stats, 'attack'),
      defense: this.getStatValue(pokemon.stats, 'defense'),
      speed: this.getStatValue(pokemon.stats, 'speed'),
    };
  }

  private getStatValue(stats: PokemonDetailStatResponse[], name: string): number {
    return stats.find((item) => item.stat.name === name)?.base_stat ?? 0;
  }
}
