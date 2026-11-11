export const GAME_LABELS: Record<string, string> = {
  pokemon: 'Pokémon',
  one_piece: 'One Piece',
}

export const GAME_FILTERS = [
  { id: 'all', label: 'Todos los premios' },
  { id: 'pokemon', label: 'Pokémon' },
  { id: 'one_piece', label: 'One Piece' },
] as const
