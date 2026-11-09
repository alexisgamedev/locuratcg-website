export type Game = 'pokemon' | 'one_piece'
export type RaffleStatus = 'draft' | 'live' | 'drawn'

export interface Raffle {
  id: string
  game: Game
  prize_name: string
  kicker: string | null
  prize_image: string | null
  retail_value: number
  entry_cost_points: number
  status: RaffleStatus
  draws_at: string | null
  entries_count: number
  entry_goal: number
  winner_name: string | null
  winner_initials: string | null
  winner_tier: string | null
  draw_note: string | null
  created_date: string
  updated_date: string
}

export interface User {
  id: string
  email: string
  full_name: string
}

export interface Membership {
  id: string
  user_id: string
  tier: string
  status: 'active' | 'canceled'
  points_balance: number
  monthly_points: number
  current_period_end: string | null
  created_date: string
  updated_date: string
}

export interface Entry {
  id: string
  user_id: string
  raffle_id: string
  raffle_title: string
  game: Game
  tickets: number
  points_spent: number
  created_date: string
  updated_date: string
}

export interface PointTransaction {
  id: string
  user_id: string
  amount: number
  description: string
  created_date: string
}

export interface ClubData {
  membership: Membership | null
  entries: Entry[]
  transactions: PointTransaction[]
}
