// Draws every live raffle whose draw date has passed.
// Picks one entry at random, weighted by how many entries each member holds.
//   npm run draw            -> draw all due raffles
//   npm run draw -- <id>    -> draw one raffle now, even if its date hasn't arrived
import { randomInt } from 'node:crypto'
import { db, now } from './db.mjs'

const TIER_NAMES = { rookie: 'Novato', collector: 'Coleccionista', master: 'Maestro' }
const forceId = process.argv[2]

const raffles = forceId
  ? db.prepare(`SELECT * FROM raffles WHERE id = ? AND status = 'live'`).all(forceId)
  : db.prepare(`SELECT * FROM raffles WHERE status = 'live' AND draws_at IS NOT NULL AND draws_at <= ?`).all(now())

if (raffles.length === 0) console.log('No raffles due for a draw.')

for (const raffle of raffles) {
  const entries = db
    .prepare(
      `SELECT e.user_id, e.tickets, u.full_name, u.email, m.tier FROM entries e
       JOIN users u ON u.id = e.user_id
       LEFT JOIN memberships m ON m.user_id = e.user_id
       WHERE e.raffle_id = ? ORDER BY e.created_date`,
    )
    .all(raffle.id)
  const total = entries.reduce((s, e) => s + e.tickets, 0)

  if (total === 0) {
    db.prepare(`UPDATE raffles SET status = 'drawn', draw_note = 'Sin boletos', updated_date = ? WHERE id = ?`).run(now(), raffle.id)
    console.log(`${raffle.prize_name}: closed with no entries.`)
    continue
  }

  let pick = randomInt(total) // 0-based entry number
  const winningNumber = pick + 1
  const winner = entries.find((e) => (pick -= e.tickets) < 0)

  const parts = (winner.full_name || winner.email.split('@')[0]).trim().split(/\s+/)
  const name = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0]
  const initials = parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase()

  db.prepare(
    `UPDATE raffles SET status = 'drawn', winner_name = ?, winner_initials = ?, winner_tier = ?,
       draw_note = ?, updated_date = ? WHERE id = ?`,
  ).run(name, initials, TIER_NAMES[winner.tier] ?? null, `Boleto #${String(winningNumber).padStart(4, '0')} de ${total}`, now(), raffle.id)

  console.log(`${raffle.prize_name}: entry #${winningNumber} of ${total} → ${name} <${winner.email}>`)
}
