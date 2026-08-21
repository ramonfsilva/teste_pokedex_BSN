import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PokemonDetailResponse } from '../models/pokemon-detail.model';
import { PokemonListResponse } from '../models/pokemon-list-response.model';
import { PokemonService } from './pokemon.service';

describe('PokemonService', () => {
  let service: PokemonService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PokemonService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(PokemonService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should request the Pokemon list with limit and offset', () => {
    service.getPokemons(20, 40).subscribe();

    const request = httpTesting.expectOne((req) => req.url === 'https://pokeapi.co/api/v2/pokemon');

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('limit')).toBe('20');
    expect(request.request.params.get('offset')).toBe('40');

    request.flush(createPokemonListResponse());
  });

  it('should map count and Pokemon list results', () => {
    service.getPokemons(20, 0).subscribe((pokemonPage) => {
      expect(pokemonPage).toEqual({
        count: 1302,
        results: [
          {
            id: 1,
            name: 'bulbasaur',
            image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
          },
          {
            id: 25,
            name: 'pikachu',
            image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
          },
        ],
      });
    });

    const request = httpTesting.expectOne('https://pokeapi.co/api/v2/pokemon?limit=20&offset=0');
    request.flush(createPokemonListResponse());
  });

  it('should request and map Pokemon details by id', () => {
    service.getPokemonById(25).subscribe((pokemon) => {
      expect(pokemon).toEqual({
        id: 25,
        name: 'pikachu',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
        types: ['electric'],
        height: 4,
        weight: 60,
        baseExperience: 112,
        abilities: ['static', 'lightning-rod'],
        hp: 35,
        attack: 55,
        defense: 40,
        speed: 90,
      });
    });

    const request = httpTesting.expectOne('https://pokeapi.co/api/v2/pokemon/25');

    expect(request.request.method).toBe('GET');

    request.flush(createPokemonDetailResponse());
  });
});

function createPokemonListResponse(): PokemonListResponse {
  return {
    count: 1302,
    next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
    previous: null,
    results: [
      {
        name: 'bulbasaur',
        url: 'https://pokeapi.co/api/v2/pokemon/1/',
      },
      {
        name: 'pikachu',
        url: 'https://pokeapi.co/api/v2/pokemon/25/',
      },
    ],
  };
}

function createPokemonDetailResponse(): PokemonDetailResponse {
  return {
    id: 25,
    name: 'pikachu',
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    },
    types: [
      {
        type: {
          name: 'electric',
        },
      },
    ],
    height: 4,
    weight: 60,
    base_experience: 112,
    abilities: [
      {
        ability: {
          name: 'static',
        },
      },
      {
        ability: {
          name: 'lightning-rod',
        },
      },
    ],
    stats: [
      createStat('hp', 35),
      createStat('attack', 55),
      createStat('defense', 40),
      createStat('speed', 90),
    ],
  };
}

function createStat(name: string, baseStat: number): PokemonDetailResponse['stats'][number] {
  return {
    base_stat: baseStat,
    stat: {
      name,
    },
  };
}
