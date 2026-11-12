/** The club's single subscription. Edit prices here. */
export const PLAN = {
  id: 'member',
  name: 'Membresía Locura TCG',
  /** Regular monthly price in Peruvian soles. */
  regularPricePen: 50,
  /** What is charged today, through Culqi. Set it equal to regularPricePen to end the discount. */
  pricePen: 30,
  /** Days of membership each payment covers. */
  periodDays: 30,
  tagline: 'Un solo plan. Participas en todos los sorteos.',
  perks: [
    'Participas automáticamente en todos los sorteos activos',
    'Un sorteo nuevo cada semana',
    'Las mismas probabilidades para todos los miembros',
    'Cancela cuando quieras desde tu cuenta',
  ],
}

export const PLAN_DISCOUNTED = PLAN.pricePen < PLAN.regularPricePen

/** A membership enters giveaways while its paid period is running, even if it was canceled. */
export function isMembershipActive(
  membership: { current_period_end: string | null } | null | undefined,
  at: number = Date.now(),
) {
  return Boolean(membership?.current_period_end && new Date(membership.current_period_end).getTime() > at)
}
