// Gives a user an active membership (and that tier's monthly points) without going through Culqi.
// Handy for local testing and for comping members.
//   npm run grant -- you@example.com collector
import { db, newId, now } from './db.mjs'

const POINTS = { rookie: 150, collector: 400, master: 900 }
const NAMES = { rookie: 'Novato', collector: 'Coleccionista', master: 'Maestro' }
const [email, tier = 'collector'] = process.argv.slice(2)

if (!email || !POINTS[tier]) {
  console.error('Usage: npm run grant -- <email> [rookie|collector|master]')
  process.exit(1)
}
const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
if (!user) {
  console.error(`No account for ${email}. Register on the site first.`)
  process.exit(1)
}

const ts = now()
const periodEnd = new Date(Date.now() + 30 * 864e5).toISOString()
db.transaction(() => {
  const existing = db.prepare('SELECT id FROM memberships WHERE user_id = ?').get(user.id)
  if (existing) {
    db.prepare(
      `UPDATE memberships SET tier = ?, status = 'active', monthly_points = ?, points_balance = points_balance + ?,
         current_period_end = ?, updated_date = ? WHERE id = ?`,
    ).run(tier, POINTS[tier], POINTS[tier], periodEnd, ts, existing.id)
  } else {
    db.prepare(
      `INSERT INTO memberships (id, user_id, tier, status, points_balance, monthly_points, current_period_end, created_date, updated_date)
       VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?)`,
    ).run(newId(), user.id, tier, POINTS[tier], POINTS[tier], periodEnd, ts, ts)
  }
  db.prepare('INSERT INTO point_transactions (id, user_id, amount, description, created_date) VALUES (?, ?, ?, ?, ?)').run(
    newId(), user.id, POINTS[tier], `Membresía ${NAMES[tier]} · puntos mensuales (otorgados)`, ts,
  )
})()
console.log(`${email} is now on ${NAMES[tier]} with +${POINTS[tier]} points.`)
