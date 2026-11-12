// Gives a user an active membership without going through Culqi.
// Handy for local testing and for comping members.
//   npm run grant -- you@example.com        -> 30 days
//   npm run grant -- you@example.com 90     -> 90 days
import { db, newId, now } from './db.mjs'

const [email, daysArg = '30'] = process.argv.slice(2)
const days = Number(daysArg)

if (!email || !Number.isFinite(days) || days <= 0) {
  console.error('Usage: npm run grant -- <email> [days]')
  process.exit(1)
}
const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
if (!user) {
  console.error(`No account for ${email}. Register on the site first.`)
  process.exit(1)
}

const ts = now()
let periodEnd
db.transaction(() => {
  const existing = db.prepare('SELECT id, current_period_end FROM memberships WHERE user_id = ?').get(user.id)
  // Granting while a period is still running adds the days on top of it.
  const running = existing?.current_period_end ? new Date(existing.current_period_end).getTime() : 0
  periodEnd = new Date(Math.max(running, Date.now()) + days * 864e5).toISOString()
  if (existing) {
    db.prepare(
      `UPDATE memberships SET tier = 'member', status = 'active', current_period_end = ?, updated_date = ? WHERE id = ?`,
    ).run(periodEnd, ts, existing.id)
  } else {
    db.prepare(
      `INSERT INTO memberships (id, user_id, tier, status, points_balance, monthly_points, current_period_end, created_date, updated_date)
       VALUES (?, ?, 'member', 'active', 0, 0, ?, ?, ?)`,
    ).run(newId(), user.id, periodEnd, ts, ts)
  }
})()
console.log(`${email} is a member until ${periodEnd.slice(0, 10)}, and is in every live raffle until then.`)
