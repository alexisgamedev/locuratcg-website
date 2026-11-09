export const GAME_LABELS: Record<string, string> = {
  pokemon: 'Pokémon',
  one_piece: 'One Piece',
}

export const GAME_FILTERS = [
  { id: 'all', label: 'All prizes' },
  { id: 'pokemon', label: 'Pokémon' },
  { id: 'one_piece', label: 'One Piece' },
] as const
