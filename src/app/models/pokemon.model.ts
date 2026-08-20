export interface Pokemon {
  id: number;
  name: string;
  image: string;
}

export interface PokemonPage {
  count: number;
  results: Pokemon[];
}
