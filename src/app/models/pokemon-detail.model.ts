export interface PokemonDetail {
  id: number;
  name: string;
  image: string;
  types: string[];
  height: number;
  weight: number;
  baseExperience: number;
  abilities: string[];
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface PokemonDetailResponse {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
  };
  types: PokemonDetailTypeResponse[];
  height: number;
  weight: number;
  base_experience: number;
  abilities: PokemonDetailAbilityResponse[];
  stats: PokemonDetailStatResponse[];
}

export interface PokemonDetailTypeResponse {
  type: {
    name: string;
  };
}

export interface PokemonDetailAbilityResponse {
  ability: {
    name: string;
  };
}

export interface PokemonDetailStatResponse {
  base_stat: number;
  stat: {
    name: string;
  };
}
