// Draws every live raffle whose draw date has passed.
// Every member whose paid period is still running has one chance; one is picked at random.
//   npm run draw            -> draw all due raffles
//   npm run draw -- <id>    -> draw one raffle now, even if its date hasn't arrived
import { randomInt } from 'node:crypto'
import { db, newId, now } from './db.mjs'

const forceId = process.argv[2]

const raffles = forceId
  ? db.prepare(`SELECT * FROM raffles WHERE id = ? AND status = 'live'`).all(forceId)
  : db.prepare(`SELECT * FROM raffles WHERE status = 'live' AND draws_at IS NOT NULL AND draws_at <= ?`).all(now())

if (raffles.length === 0) console.log('No raffles due for a draw.')

for (const raffle of raffles) {
  db.transaction(() => {
    const ts = now()
    const members = db
      .prepare(
        `SELECT u.id AS user_id, u.email, u.full_name FROM memberships m
         JOIN users u ON u.id = m.user_id
         WHERE m.current_period_end IS NOT NULL AND m.current_period_end > ?
         ORDER BY m.created_date, u.id`,
      )
      .all(ts)
    const total = members.length

    // Keep a record of exactly who was in the draw.
    db.prepare('DELETE FROM entries WHERE raffle_id = ?').run(raffle.id)
    const insert = db.prepare(
      `INSERT INTO entries (id, user_id, raffle_id, raffle_title, game, tickets, points_spent, created_date, updated_date)
       VALUES (?, ?, ?, ?, ?, 1, 0, ?, ?)`,
    )
    for (const m of members) insert.run(newId(), m.user_id, raffle.id, raffle.prize_name, raffle.game, ts, ts)

    if (total === 0) {
      db.prepare(
        `UPDATE raffles SET status = 'drawn', entries_count = 0, winner_name = NULL, winner_initials = NULL,
           winner_tier = NULL, draw_note = 'Sin participantes', updated_date = ? WHERE id = ?`,
      ).run(ts, raffle.id)
      console.log(`${raffle.prize_name}: closed with no participants.`)
      return
    }

    const pick = randomInt(total)
    const winner = members[pick]
    const parts = (winner.full_name || winner.email.split('@')[0]).trim().split(/\s+/)
    const name = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0]
    const initials = parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase()

    db.prepare(
      `UPDATE raffles SET status = 'drawn', entries_count = ?, winner_name = ?, winner_initials = ?,
         winner_tier = NULL, draw_note = ?, updated_date = ? WHERE id = ?`,
    ).run(total, name, initials, `Participante #${String(pick + 1).padStart(4, '0')} de ${total}`, ts, raffle.id)

    console.log(`${raffle.prize_name}: participant #${pick + 1} of ${total} → ${name} <${winner.email}>`)
  })()
}
