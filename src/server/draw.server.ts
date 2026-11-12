import { randomInt } from 'node:crypto'
import { db, newId, now } from './db.server'
import type { Raffle, RaffleEntrant } from '@/lib/types'

/** "Ana Rodríguez" -> { name: "Ana R.", initials: "AR" } */
function displayName(fullName: string, email: string) {
  const parts = (fullName || email.split('@')[0]).trim().split(/\s+/)
  const name = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0]
  const initials = parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase()
  return { name, initials }
}

/** Everyone whose paid membership period is still running: they are in every live raffle. */
export function activeMembers(at: string = now()) {
  return db
    .prepare(
      `SELECT u.id AS user_id, u.email, u.full_name FROM memberships m
       JOIN users u ON u.id = m.user_id
       WHERE m.current_period_end IS NOT NULL AND m.current_period_end > ?
       ORDER BY m.created_date, u.id`,
    )
    .all(at) as RaffleEntrant[]
}

export function countActiveMembers(at: string = now()) {
  const row = db
    .prepare('SELECT COUNT(*) AS n FROM memberships WHERE current_period_end IS NOT NULL AND current_period_end > ?')
    .get(at) as { n: number }
  return row.n
}

/**
 * Draws one live raffle: every active member has one chance, and one is picked at random.
 * The members who took part are saved as the raffle's entries, and the raffle is marked as drawn.
 */
export function drawRaffle(raffleId: string) {
  return db.transaction(() => {
    const raffle = db.prepare('SELECT * FROM raffles WHERE id = ?').get(raffleId) as Raffle | undefined
    if (!raffle) throw new Error('Sorteo no encontrado.')
    if (raffle.status !== 'live') throw new Error('Solo se pueden sortear los sorteos activos.')

    const ts = now()
    const members = activeMembers(ts)
    const total = members.length

    // Keep a record of exactly who was in the draw.
    db.prepare('DELETE FROM entries WHERE raffle_id = ?').run(raffleId)
    const insert = db.prepare(
      `INSERT INTO entries (id, user_id, raffle_id, raffle_title, game, tickets, points_spent, created_date, updated_date)
       VALUES (?, ?, ?, ?, ?, 1, 0, ?, ?)`,
    )
    for (const m of members) insert.run(newId(), m.user_id, raffle.id, raffle.prize_name, raffle.game, ts, ts)

    if (total === 0) {
      db.prepare(
        `UPDATE raffles SET status = 'drawn', entries_count = 0, winner_name = NULL, winner_initials = NULL,
           winner_tier = NULL, draw_note = 'Sin participantes', updated_date = ? WHERE id = ?`,
      ).run(ts, raffleId)
      return { winner: null as null | { name: string; email: string }, total }
    }

    const pick = randomInt(total)
    const winner = members[pick]
    const { name, initials } = displayName(winner.full_name, winner.email)

    db.prepare(
      `UPDATE raffles SET status = 'drawn', entries_count = ?, winner_name = ?, winner_initials = ?,
         winner_tier = NULL, draw_note = ?, updated_date = ? WHERE id = ?`,
    ).run(total, name, initials, `Participante #${String(pick + 1).padStart(4, '0')} de ${total}`, ts, raffleId)
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
