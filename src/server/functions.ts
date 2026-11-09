// Server functions: these run on the server, and the client calls them like normal async functions.
import { createServerFn } from '@tanstack/react-start'
import { randomBytes } from 'node:crypto'
import { db, newId, now } from './db.server'
import {
  createUser,
  currentUser,
  endSession,
  hashPassword,
  requireUser,
  startSession,
  verifyPassword,
} from './auth.server'
import { createCharge, culqiConfigured } from './culqi.server'
import { getTier, isTierId } from '@/lib/tiers'
import type { ClubData, Entry, Membership, PointTransaction, Raffle, User } from '@/lib/types'

const MAX_ENTRIES_PER_ORDER = 20

// ---------- Auth ----------

export const getSession = createServerFn({ method: 'GET' }).handler(async (): Promise<User | null> => {
  return currentUser()
})

function cleanEmail(v: unknown) {
  const email = String(v ?? '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.')
  return email
}

function cleanPassword(v: unknown) {
  const password = String(v ?? '')
  if (password.length < 8) throw new Error('Password must be at least 8 characters.')
  return password
}

export const register = createServerFn({ method: 'POST' })
  .validator((d: { email: string; password: string; fullName: string }) => ({
    email: cleanEmail(d.email),
    password: cleanPassword(d.password),
    fullName: String(d.fullName ?? '').trim().slice(0, 80),
  }))
  .handler(async ({ data }) => {
    const exists = db.prepare('SELECT 1 FROM users WHERE email = ?').get(data.email)
    if (exists) throw new Error('An account with that email already exists. Log in instead.')
    const user = createUser(data.email, data.password, data.fullName)
    startSession(user.id)
    return user
  })

export const login = createServerFn({ method: 'POST' })
  .validator((d: { email: string; password: string }) => ({
    email: String(d.email ?? '').trim().toLowerCase(),
    password: String(d.password ?? ''),
  }))
  .handler(async ({ data }) => {
    const row = db
      .prepare('SELECT id, email, full_name, password_hash FROM users WHERE email = ?')
      .get(data.email) as (User & { password_hash: string }) | undefined
    if (!row || !verifyPassword(data.password, row.password_hash)) {
      throw new Error('Invalid email or password')
    }
    startSession(row.id)
    return { id: row.id, email: row.email, full_name: row.full_name } satisfies User
  })

export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  endSession()
  return { ok: true }
})

export const requestPasswordReset = createServerFn({ method: 'POST' })
  .validator((d: { email: string }) => ({ email: String(d.email ?? '').trim().toLowerCase() }))
  .handler(async ({ data }) => {
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email) as
      | { id: string }
      | undefined
    if (user) {
      const token = randomBytes(24).toString('hex')
      const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString()
      db.prepare('INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)').run(
        token,
        user.id,
        expires,
      )
      const base = process.env.APP_URL || 'http://localhost:3000'
      // TODO: send this by email (Resend, Postmark, SES…). Until then it is printed in the server log.
      console.log(`[password reset] ${data.email}: ${base}/reset-password?token=${token}`)
    }
    // Same answer either way so the form doesn't reveal which emails have accounts.
    return { ok: true }
  })

export const resetPassword = createServerFn({ method: 'POST' })
  .validator((d: { token: string; password: string }) => ({
    token: String(d.token ?? ''),
    password: cleanPassword(d.password),
  }))
  .handler(async ({ data }) => {
    const row = db
      .prepare('SELECT user_id FROM password_resets WHERE token = ? AND expires_at > ?')
      .get(data.token, now()) as { user_id: string } | undefined
    if (!row) throw new Error('This reset link has expired. Request a new one.')
    db.transaction(() => {
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(
        hashPassword(data.password),
        row.user_id,
      )
      db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(row.user_id)
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(row.user_id)
    })()
    startSession(row.user_id)
    return { ok: true }
  })

// ---------- Raffles ----------

export const listRaffles = createServerFn({ method: 'GET' }).handler(async (): Promise<Raffle[]> => {
  return db
    .prepare(
      `SELECT * FROM raffles WHERE status IN ('live', 'drawn')
       ORDER BY CASE status WHEN 'live' THEN 0 ELSE 1 END,
                CASE status WHEN 'live' THEN draws_at END ASC,
                draws_at DESC`,
    )
    .all() as Raffle[]
})

export const getRaffle = createServerFn({ method: 'GET' })
  .validator((d: { id: string }) => ({ id: String(d.id) }))
  .handler(async ({ data }): Promise<Raffle | null> => {
    const raffle = db
      .prepare(`SELECT * FROM raffles WHERE id = ? AND status != 'draft'`)
      .get(data.id) as Raffle | undefined
    return raffle ?? null
  })

// ---------- Membership & vault ----------

function getMembership(userId: string) {
  return (db.prepare('SELECT * FROM memberships WHERE user_id = ?').get(userId) as Membership) ?? null
}

export const getMyClub = createServerFn({ method: 'POST' }).handler(async (): Promise<ClubData> => {
  const user = requireUser()
  return {
    membership: getMembership(user.id),
    entries: db
      .prepare('SELECT * FROM entries WHERE user_id = ? ORDER BY updated_date DESC')
      .all(user.id) as Entry[],
    transactions: db
      .prepare('SELECT * FROM point_transactions WHERE user_id = ? ORDER BY created_date DESC LIMIT 20')
      .all(user.id) as PointTransaction[],
  }
})

export const enterRaffle = createServerFn({ method: 'POST' })
  .validator((d: { raffleId: string; entries: number }) => {
    const entries = Math.floor(Number(d.entries))
    if (!Number.isFinite(entries) || entries < 1 || entries > MAX_ENTRIES_PER_ORDER) {
      throw new Error(`Choose between 1 and ${MAX_ENTRIES_PER_ORDER} entries.`)
    }
    return { raffleId: String(d.raffleId), entries }
  })
  .handler(async ({ data }) => {
    const user = requireUser()
    const ts = now()

    return db.transaction(() => {
      const raffle = db.prepare('SELECT * FROM raffles WHERE id = ?').get(data.raffleId) as
        | Raffle
        | undefined
      if (!raffle || raffle.status !== 'live') throw new Error('This raffle is closed.')
      if (raffle.draws_at && new Date(raffle.draws_at).getTime() <= Date.now()) {
        throw new Error('Entries for this raffle have closed.')
      }

      const membership = getMembership(user.id)
      if (!membership) throw new Error('Join a tier to start entering raffles.')

      const cost = raffle.entry_cost_points * data.entries
      if (membership.points_balance < cost) throw new Error("You don't have enough points for that.")

      db.prepare(
        'UPDATE memberships SET points_balance = points_balance - ?, updated_date = ? WHERE id = ?',
      ).run(cost, ts, membership.id)

      db.prepare(
        `INSERT INTO entries (id, user_id, raffle_id, raffle_title, game, tickets, points_spent, created_date, updated_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (user_id, raffle_id) DO UPDATE SET
           tickets = tickets + excluded.tickets,
           points_spent = points_spent + excluded.points_spent,
           updated_date = excluded.updated_date`,
      ).run(newId(), user.id, raffle.id, raffle.prize_name, raffle.game, data.entries, cost, ts, ts)

      db.prepare(
        'UPDATE raffles SET entries_count = entries_count + ?, updated_date = ? WHERE id = ?',
      ).run(data.entries, ts, raffle.id)

      db.prepare(
        'INSERT INTO point_transactions (id, user_id, amount, description, created_date) VALUES (?, ?, ?, ?, ?)',
      ).run(
        newId(),
        user.id,
        -cost,
        `${data.entries} ${data.entries === 1 ? 'entry' : 'entries'} · ${raffle.prize_name}`,
        ts,
      )

      return { ok: true, balance: membership.points_balance - cost }
    })()
  })

export const cancelMembership = createServerFn({ method: 'POST' }).handler(async () => {
  const user = requireUser()
  const membership = getMembership(user.id)
  if (!membership || membership.status !== 'active') throw new Error('No active membership to cancel.')
  db.prepare(`UPDATE memberships SET status = 'canceled', updated_date = ? WHERE id = ?`).run(
    now(),
    membership.id,
  )
  return { ok: true }
})

// ---------- Checkout (Culqi) ----------

/** Step 1: tell the browser what to charge, so it can open Culqi Checkout. */
export const startCheckout = createServerFn({ method: 'POST' })
  .validator((d: { tier: string }) => {
    if (!isTierId(d.tier)) throw new Error('Unknown tier.')
    return { tier: d.tier }
  })
  .handler(async ({ data }) => {
    requireUser()
    const tier = getTier(data.tier)
    if (!culqiConfigured()) return { configured: false as const }
    return {
      configured: true as const,
      publicKey: process.env.CULQI_PUBLIC_KEY as string,
      amountCents: tier.pricePen * 100,
      title: 'Pull Club',
      description: `${tier.name} membership — 1 month`,
    }
  })

/** Step 2: charge the card token from Culqi, then activate the membership and drop the points. */
export const confirmPayment = createServerFn({ method: 'POST' })
  .validator((d: { tier: string; tokenId: string }) => {
    if (!isTierId(d.tier)) throw new Error('Unknown tier.')
    if (!d.tokenId) throw new Error('Missing payment token.')
    return { tier: d.tier, tokenId: String(d.tokenId) }
  })
  .handler(async ({ data }) => {
    const user = requireUser()
    if (!culqiConfigured()) throw new Error("Payments aren't configured yet.")
    const tier = getTier(data.tier)
    const amountCents = tier.pricePen * 100

    const charge = await createCharge({
      tokenId: data.tokenId,
      amountCents,
      email: user.email,
      description: `Pull Club ${tier.name} membership`,
    })

    const ts = now()
    const periodEnd = new Date(Date.now() + 30 * 864e5).toISOString()
    db.transaction(() => {
      db.prepare(
        `INSERT INTO payments (id, user_id, tier, amount_cents, currency, provider, provider_charge_id, status, created_date)
         VALUES (?, ?, ?, ?, 'PEN', 'culqi', ?, 'paid', ?)`,
      ).run(newId(), user.id, tier.id, amountCents, charge.id, ts)

      const existing = getMembership(user.id)
      if (existing) {
        db.prepare(
          `UPDATE memberships SET tier = ?, status = 'active', monthly_points = ?,
             points_balance = points_balance + ?, current_period_end = ?, updated_date = ?
           WHERE id = ?`,
        ).run(tier.id, tier.points, tier.points, periodEnd, ts, existing.id)
      } else {
        db.prepare(
          `INSERT INTO memberships (id, user_id, tier, status, points_balance, monthly_points, current_period_end, created_date, updated_date)
           VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?)`,
        ).run(newId(), user.id, tier.id, tier.points, tier.points, periodEnd, ts, ts)
      }

      db.prepare(
        'INSERT INTO point_transactions (id, user_id, amount, description, created_date) VALUES (?, ?, ?, ?, ?)',
      ).run(newId(), user.id, tier.points, `${tier.name} membership · monthly points`, ts)
    })()

    return { granted: tier.points }
  })
