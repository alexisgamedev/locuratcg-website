export type TierId = 'rookie' | 'collector' | 'master'

export interface Tier {
  id: TierId
  name: string
  /** USD reference price (not shown on the site) */
  price: number
  /** Monthly price in Peruvian soles, charged through Culqi */
  pricePen: number
  /** Vault points added every month */
  points: number
  tagline: string
  perks: string[]
  accent: string
  ring: string
  featured?: boolean
}

export const TIERS: Tier[] = [
  {
    id: 'rookie',
    name: 'Rookie',
    price: 14,
    pricePen: 50,
    points: 150,
    tagline: 'Start chasing the grails.',
    perks: ['150 vault points every month', 'Entries in every live raffle', 'Member-only raffle drops'],
    accent: 'from-sky-400/20 to-transparent',
    ring: 'ring-border',
  },
  {
    id: 'collector',
    name: 'Collector',
    price: 29,
    pricePen: 110,
    points: 400,
    tagline: 'The sweet spot for pack openers.',
    perks: [
      '400 vault points every month',
      'Early access, 24h before public drop',
      'Double points on your birthday month',
      'Entries in every live raffle',
    ],
    accent: 'from-primary/25 to-transparent',
    ring: 'ring-primary/50',
    featured: true,
  },
  {
    id: 'master',
    name: 'Master',
    price: 59,
    pricePen: 220,
    points: 900,
    tagline: 'For the grail hunters.',
    perks: [
      '900 vault points every month',
      'Early access, 48h before public drop',
      'One free entry every month, on us',
      'Priority shipping on every win',
      'Entries in every live raffle',
    ],
    accent: 'from-holo/25 to-transparent',
    ring: 'ring-holo/50',
  },
]

export function getTier(id: string | null | undefined): Tier {
  return TIERS.find((t) => t.id === id) || TIERS[0]
}

export function isTierId(id: unknown): id is TierId {
  return TIERS.some((t) => t.id === id)
}
