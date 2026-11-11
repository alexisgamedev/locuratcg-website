// Server functions for the admin area. Every one of them checks requireAdmin() first.
import { createServerFn } from '@tanstack/react-start'
import { randomBytes } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { requireAdmin } from './auth.server'
import { db, newId, now, UPLOADS_DIR } from './db.server'
import { drawDueRaffles, drawRaffle } from './draw.server'
import { GAME_LABELS } from '@/lib/games'
import type { Raffle, RaffleEntrant, RaffleInput } from '@/lib/types'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export const adminListRaffles = createServerFn({ method: 'GET' }).handler(async () => {
  requireAdmin()
  drawDueRaffles()
  const raffles = db
    .prepare(
      `SELECT * FROM raffles
       ORDER BY CASE status WHEN 'draft' THEN 0 WHEN 'live' THEN 1 ELSE 2 END, draws_at DESC`,
    )
    .all() as Raffle[]
  const stats = db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM users) AS users,
         (SELECT COUNT(*) FROM memberships WHERE status = 'active') AS members,
         (SELECT COALESCE(SUM(tickets), 0) FROM entries) AS entries`,
    )
    .get() as { users: number; members: number; entries: number }
  return { raffles, stats }
})

export const adminGetRaffle = createServerFn({ method: 'GET' })
  .validator((d: { id: string }) => ({ id: String(d.id) }))
  .handler(async ({ data }) => {
    requireAdmin()
    const raffle = (db.prepare('SELECT * FROM raffles WHERE id = ?').get(data.id) as Raffle) ?? null
    const entrants = db
      .prepare(
        `SELECT e.user_id, u.email, u.full_name, m.tier, e.tickets, e.points_spent FROM entries e
         JOIN users u ON u.id = e.user_id
         LEFT JOIN memberships m ON m.user_id = e.user_id
         WHERE e.raffle_id = ? ORDER BY e.tickets DESC`,
      )
      .all(data.id) as RaffleEntrant[]
    return { raffle, entrants }
  })

function validateRaffle(d: RaffleInput): RaffleInput {
  const num = (v: unknown, label: string, min: number) => {
    const n = Number(v)
    if (!Number.isFinite(n) || n < min) throw new Error(`${label} must be at least ${min}.`)
    return n
  }
  if (!(d.game in GAME_LABELS)) throw new Error('Pick a game.')
  const prize_name = String(d.prize_name ?? '').trim()
  if (!prize_name) throw new Error('Give the prize a name.')
  if (d.status !== 'draft' && d.status !== 'live') throw new Error('Status must be draft or live.')

  let draws_at: string | null = null
  if (d.draws_at) {
    const t = new Date(d.draws_at)
    if (Number.isNaN(t.getTime())) throw new Error('The draw date is not valid.')
    draws_at = t.toISOString()
  }
  if (d.status === 'live') {
    if (!draws_at) throw new Error('Set a draw date before publishing.')
    if (new Date(draws_at).getTime() <= Date.now()) throw new Error('The draw date must be in the future.')
  }

  const prize_image = String(d.prize_image ?? '').trim()
  if (prize_image && !/^(https:\/\/|\/uploads\/)/.test(prize_image)) {
    throw new Error('The image must be an uploaded file or an https:// link.')
  }

  return {
    id: d.id ? String(d.id) : undefined,
    game: d.game,
    prize_name: prize_name.slice(0, 160),
    kicker: String(d.kicker ?? '').trim().slice(0, 60),
    prize_image,
    retail_value: num(d.retail_value, 'Retail value', 0),
    entry_cost_points: Math.round(num(d.entry_cost_points, 'Points per entry', 1)),
    entry_goal: Math.round(num(d.entry_goal, 'Entry goal', 1)),
    draws_at,
    status: d.status,
  }
}

export const saveRaffle = createServerFn({ method: 'POST' })
  .validator((d: RaffleInput) => validateRaffle(d))
  .handler(async ({ data }) => {
    requireAdmin()
    const ts = now()
    const fields = {
      game: data.game,
      prize_name: data.prize_name,
      kicker: data.kicker || null,
      prize_image: data.prize_image || null,
      retail_value: data.retail_value,
      entry_cost_points: data.entry_cost_points,
      entry_goal: data.entry_goal,
      draws_at: data.draws_at,
      status: data.status,
      updated_date: ts,
    }

    if (data.id) {
      const existing = db.prepare('SELECT status FROM raffles WHERE id = ?').get(data.id) as
        | { status: string }
        | undefined
      if (!existing) throw new Error('Raffle not found.')
      if (existing.status === 'drawn') throw new Error('This raffle has already been drawn and can no longer be edited.')
      db.prepare(
        `UPDATE raffles SET game = @game, prize_name = @prize_name, kicker = @kicker, prize_image = @prize_image,
           retail_value = @retail_value, entry_cost_points = @entry_cost_points, entry_goal = @entry_goal,
           draws_at = @draws_at, status = @status, updated_date = @updated_date
         WHERE id = @id`,
      ).run({ ...fields, id: data.id })
      return { id: data.id }
    }

    const id = newId()
    db.prepare(
      `INSERT INTO raffles (id, game, prize_name, kicker, prize_image, retail_value, entry_cost_points, entry_goal,
         draws_at, status, entries_count, created_date, updated_date)
       VALUES (@id, @game, @prize_name, @kicker, @prize_image, @retail_value, @entry_cost_points, @entry_goal,
         @draws_at, @status, 0, @created_date, @updated_date)`,
    ).run({ ...fields, id, created_date: ts })
    return { id }
  })

export const deleteRaffle = createServerFn({ method: 'POST' })
  .validator((d: { id: string }) => ({ id: String(d.id) }))
  .handler(async ({ data }) => {
    requireAdmin()
    const { n } = db.prepare('SELECT COUNT(*) AS n FROM entries WHERE raffle_id = ?').get(data.id) as { n: number }
    if (n > 0) {
      throw new Error("Members have already entered this raffle, so it can't be deleted. Draw it instead.")
    }
    db.prepare('DELETE FROM raffles WHERE id = ?').run(data.id)
    return { ok: true }
  })

export const drawRaffleNow = createServerFn({ method: 'POST' })
  .validator((d: { id: string }) => ({ id: String(d.id) }))
  .handler(async ({ data }) => {
    requireAdmin()
    return drawRaffle(data.id)
  })

/** Saves an uploaded prize image to the uploads folder and returns its URL. */
export const uploadImage = createServerFn({ method: 'POST' })
  .validator((d: FormData) => {
    if (!(d instanceof FormData)) throw new Error('Expected a file upload.')
    const file = d.get('file')
    if (!(file instanceof File)) throw new Error('Choose an image to upload.')
    return file
  })
  .handler(async ({ data: file }) => {
    requireAdmin()
    const ext = IMAGE_TYPES[file.type]
    if (!ext) throw new Error('Upload a JPG, PNG, WebP or GIF image.')
    if (file.size > MAX_IMAGE_BYTES) throw new Error('Images must be 5 MB or smaller.')
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
    const name = `${randomBytes(12).toString('hex')}.${ext}`
    fs.writeFileSync(path.join(UPLOADS_DIR, name), Buffer.from(await file.arrayBuffer()))
    return { url: `/uploads/${name}` }
  })
