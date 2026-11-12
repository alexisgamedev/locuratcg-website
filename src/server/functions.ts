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
import { countActiveMembers, drawDueRaffles } from './draw.server'
import { isMembershipActive, PLAN } from '@/lib/plan'
import type { ClubData, Entry, Membership, Raffle, User } from '@/lib/types'

// ---------- Auth ----------

export const getSession = createServerFn({ method: 'GET' }).handler(async (): Promise<User | null> => {
  return currentUser()
})

function cleanEmail(v: unknown) {
  const email = String(v ?? '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Ingresa un correo electrónico válido.')
  return email
}

function cleanPassword(v: unknown) {
  const password = String(v ?? '')
  if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.')
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
    if (exists) throw new Error('Ya existe una cuenta con ese correo. Inicia sesión.')
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
      throw new Error('Correo o contraseña incorrectos')
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
    if (!row) throw new Error('Este enlace para restablecer la contraseña expiró. Solicita uno nuevo.')
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

/** While a raffle is live, its participants are simply everyone with an active membership. */
function withParticipants<T extends Raffle>(raffles: T[]): T[] {
  if (!raffles.some((r) => r.status === 'live')) return raffles
  const members = countActiveMembers()
  return raffles.map((r) => (r.status === 'live' ? { ...r, entries_count: members } : r))
}

export const listRaffles = createServerFn({ method: 'GET' }).handler(async (): Promise<Raffle[]> => {
  drawDueRaffles()
  const raffles = db
    .prepare(
      `SELECT * FROM raffles WHERE status IN ('live', 'drawn')
       ORDER BY CASE status WHEN 'live' THEN 0 ELSE 1 END,
                CASE status WHEN 'live' THEN draws_at END ASC,
                draws_at DESC`,
    )
    .all() as Raffle[]
  return withParticipants(raffles)
})

export const getRaffle = createServerFn({ method: 'GET' })
  .validator((d: { id: string }) => ({ id: String(d.id) }))
  .handler(async ({ data }): Promise<Raffle | null> => {
    drawDueRaffles()
    const raffle = db
      .prepare(`SELECT * FROM raffles WHERE id = ? AND status != 'draft'`)
      .get(data.id) as Raffle | undefined
    return raffle ? withParticipants([raffle])[0] : null
  })

// ---------- Membership ----------

function getMembership(userId: string) {
  return (db.prepare('SELECT * FROM memberships WHERE user_id = ?').get(userId) as Membership) ?? null
}

export const getMyClub = createServerFn({ method: 'POST' }).handler(async (): Promise<ClubData> => {
  const user = requireUser()
  const membership = getMembership(user.id)
  return {
    membership,
    isActive: isMembershipActive(membership),
    entries: db
      .prepare(
        `SELECT e.* FROM entries e JOIN raffles r ON r.id = e.raffle_id
         WHERE e.user_id = ? AND r.status = 'drawn' ORDER BY e.created_date DESC LIMIT 50`,
      )
      .all(user.id) as Entry[],
  }
})

export const cancelMembership = createServerFn({ method: 'POST' }).handler(async () => {
  const user = requireUser()
  const membership = getMembership(user.id)
  if (!membership || membership.status !== 'active') throw new Error('No tienes una membresía activa para cancelar.')
  db.prepare(`UPDATE memberships SET status = 'canceled', updated_date = ? WHERE id = ?`).run(
    now(),
    membership.id,
  )
  return { ok: true }
})

// ---------- Checkout (Culqi) ----------

/** Step 1: tell the browser what to charge, so it can open Culqi Checkout. */
export const startCheckout = createServerFn({ method: 'POST' }).handler(async () => {
  requireUser()
  if (!culqiConfigured()) return { configured: false as const }
  return {
    configured: true as const,
    publicKey: process.env.CULQI_PUBLIC_KEY as string,
    amountCents: PLAN.pricePen * 100,
    title: 'Locura TCG',
    description: `${PLAN.name} — 1 mes`,
  }
})

/** Step 2: charge the card token from Culqi, then start (or extend) the membership. */
export const confirmPayment = createServerFn({ method: 'POST' })
  .validator((d: { tokenId: string }) => {
    if (!d.tokenId) throw new Error('Falta el token de pago.')
    return { tokenId: String(d.tokenId) }
  })
  .handler(async ({ data }) => {
    const user = requireUser()
    if (!culqiConfigured()) throw new Error('Los pagos aún no están configurados.')
    const amountCents = PLAN.pricePen * 100

    const charge = await createCharge({
      tokenId: data.tokenId,
      amountCents,
      email: user.email,
      description: PLAN.name,
    })

    const ts = now()
    return db.transaction(() => {
      db.prepare(
        `INSERT INTO payments (id, user_id, tier, amount_cents, currency, provider, provider_charge_id, status, created_date)
         VALUES (?, ?, ?, ?, 'PEN', 'culqi', ?, 'paid', ?)`,
      ).run(newId(), user.id, PLAN.id, amountCents, charge.id, ts)

      // Paying while a period is still running adds a month on top of it.
      const existing = getMembership(user.id)
      const from = isMembershipActive(existing) ? new Date(existing.current_period_end as string).getTime() : Date.now()
      const periodEnd = new Date(from + PLAN.periodDays * 864e5).toISOString()

      if (existing) {
        db.prepare(
          `UPDATE memberships SET tier = ?, status = 'active', current_period_end = ?, updated_date = ? WHERE id = ?`,
        ).run(PLAN.id, periodEnd, ts, existing.id)
      } else {
        db.prepare(
          `INSERT INTO memberships (id, user_id, tier, status, points_balance, monthly_points, current_period_end, created_date, updated_date)
           VALUES (?, ?, ?, 'active', 0, 0, ?, ?, ?)`,
        ).run(newId(), user.id, PLAN.id, periodEnd, ts, ts)
      }
      return { periodEnd }
    })()
  })
