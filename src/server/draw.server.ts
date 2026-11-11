import { randomInt } from 'node:crypto'
import { db, now } from './db.server'
import { getTier } from '@/lib/tiers'
import type { Raffle } from '@/lib/types'

/** "Ana Rodríguez" -> { name: "Ana R.", initials: "AR" } */
function displayName(fullName: string, email: string) {
  const parts = (fullName || email.split('@')[0]).trim().split(/\s+/)
  const name = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0]
  const initials = parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase()
  return { name, initials }
}

/**
 * Draws one live raffle: picks a random entry number, weighted by how many entries each member holds,
 * and marks the raffle as drawn. Returns the updated raffle.
 */
export function drawRaffle(raffleId: string) {
  return db.transaction(() => {
    const raffle = db.prepare('SELECT * FROM raffles WHERE id = ?').get(raffleId) as Raffle | undefined
    if (!raffle) throw new Error('Sorteo no encontrado.')
    if (raffle.status !== 'live') throw new Error('Solo se pueden sortear los sorteos activos.')

    const entries = db
      .prepare(
        `SELECT e.tickets, u.full_name, u.email, m.tier FROM entries e
         JOIN users u ON u.id = e.user_id
         LEFT JOIN memberships m ON m.user_id = e.user_id
         WHERE e.raffle_id = ? ORDER BY e.created_date`,
      )
      .all(raffleId) as { tickets: number; full_name: string; email: string; tier: string | null }[]
    const total = entries.reduce((s, e) => s + e.tickets, 0)
    const ts = now()

    if (total === 0) {
      db.prepare(
        `UPDATE raffles SET status = 'drawn', winner_name = NULL, winner_initials = NULL, winner_tier = NULL,
           draw_note = 'Sin boletos', updated_date = ? WHERE id = ?`,
      ).run(ts, raffleId)
      return { winner: null as null | { name: string; email: string }, total }
    }

    let pick = randomInt(total)
    const winningNumber = pick + 1
    const winner = entries.find((e) => (pick -= e.tickets) < 0)!
    const { name, initials } = displayName(winner.full_name, winner.email)

    db.prepare(
      `UPDATE raffles SET status = 'drawn', winner_name = ?, winner_initials = ?, winner_tier = ?,
         draw_note = ?, updated_date = ? WHERE id = ?`,
    ).run(
      name,
      initials,
      winner.tier ? getTier(winner.tier).name : null,
      `Boleto #${String(winningNumber).padStart(4, '0')} de ${total}`,
      ts,
      raffleId,
    )
    return { winner: { name, email: winner.email }, total }
  })()
}

/** Draws every live raffle whose draw date has passed. Called whenever raffles are listed. */
export function drawDueRaffles() {
  const due = db
    .prepare(`SELECT id FROM raffles WHERE status = 'live' AND draws_at IS NOT NULL AND draws_at <= ?`)
    .all(now()) as { id: string }[]
  for (const { id } of due) {
    try {
      drawRaffle(id)
    } catch (err) {
      console.error(`[draw] ${id}:`, err)
    }
  }
}
