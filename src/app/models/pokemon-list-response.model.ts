export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItemResponse[];
}

export interface PokemonListItemResponse {
  name: string;
  url: string;
}
