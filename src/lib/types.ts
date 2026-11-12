export type Game = 'pokemon' | 'one_piece'
export type RaffleStatus = 'draft' | 'live' | 'drawn'

export interface Raffle {
  id: string
  game: Game
  prize_name: string
  kicker: string | null
  prize_image: string | null
  retail_value: number
  status: RaffleStatus
  draws_at: string | null
  /** Members taking part: everyone with an active membership while live, the snapshot taken at the draw afterwards. */
  entries_count: number
  winner_name: string | null
  winner_initials: string | null
  draw_note: string | null
  created_date: string
  updated_date: string
}

export interface User {
  id: string
  email: string
  full_name: string
  /** True when the email is listed in the ADMIN_EMAILS environment variable */
  is_admin?: boolean
}

export interface Membership {
  id: string
  user_id: string
  tier: string
  status: 'active' | 'canceled'
  current_period_end: string | null
  created_date: string
  updated_date: string
}

/** A member's place in a raffle that has been drawn. */
export interface Entry {
  id: string
  user_id: string
  raffle_id: string
  raffle_title: string
  game: Game
  created_date: string
}

export interface ClubData {
  membership: Membership | null
  /** True while the paid period is running, so the member is in every live raffle. */
  isActive: boolean
  /** Past raffles this member took part in. */
  entries: Entry[]
}

export interface RaffleEntrant {
  user_id: string
  email: string
  full_name: string
}

export interface RaffleInput {
  id?: string
  game: Game
  prize_name: string
  kicker: string
  prize_image: string
  retail_value: number
  draws_at: string | null
  status: 'draft' | 'live'
}
