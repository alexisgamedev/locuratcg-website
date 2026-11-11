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
    name: 'Novato',
    price: 14,
    pricePen: 50,
    points: 150,
    tagline: 'Empieza a ir por tus griales.',
    perks: ['150 puntos en tu bóveda cada mes', 'Participa en todos los sorteos activos', 'Sorteos exclusivos para miembros'],
    accent: 'from-sky-400/20 to-transparent',
    ring: 'ring-border',
  },
  {
    id: 'collector',
    name: 'Coleccionista',
    price: 29,
    pricePen: 110,
    points: 400,
    tagline: 'El punto ideal para los que abren sobres.',
    perks: [
      '400 puntos en tu bóveda cada mes',
      'Acceso anticipado, 24 h antes del lanzamiento público',
      'Puntos dobles en el mes de tu cumpleaños',
      'Participa en todos los sorteos activos',
    ],
    accent: 'from-primary/25 to-transparent',
    ring: 'ring-primary/50',
    featured: true,
  },
  {
    id: 'master',
    name: 'Maestro',
    price: 59,
    pricePen: 220,
    points: 900,
    tagline: 'Para los cazadores de griales.',
    perks: [
      '900 puntos en tu bóveda cada mes',
      'Acceso anticipado, 48 h antes del lanzamiento público',
      'Un boleto gratis cada mes, invitado por la casa',
      'Envío prioritario en cada premio',
      'Participa en todos los sorteos activos',
    ],
    accent: 'from-holo/25 to-transparent',
    ring: 'ring-holo/50',
  },
]

export function getTier(id: string | null | undefined): Tier {
  return TIERS.find((t) => t.id === id) || TIERS[0]
}

// Winner tiers saved before the site was translated hold the English names.
const LEGACY_TIER_NAMES: Record<string, TierId> = { Rookie: 'rookie', Collector: 'collector', Master: 'master' }

/** Display name for a stored tier id or tier name (including the old English names). */
export function tierLabel(value: string | null | undefined): string | null {
  if (!value) return null
  const id = LEGACY_TIER_NAMES[value] ?? value
  return TIERS.find((t) => t.id === id || t.name === value)?.name ?? value
}

export function isTierId(id: unknown): id is TierId {
  return TIERS.some((t) => t.id === id)
}
