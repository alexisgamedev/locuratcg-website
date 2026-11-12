// Server functions for the admin area. Every one of them checks requireAdmin() first.
import { createServerFn } from '@tanstack/react-start'
import { randomBytes } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { requireAdmin } from './auth.server'
import { db, newId, now, UPLOADS_DIR } from './db.server'
import { activeMembers, countActiveMembers, drawDueRaffles, drawRaffle } from './draw.server'
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
  const members = countActiveMembers()
  const { users } = db.prepare('SELECT COUNT(*) AS users FROM users').get() as { users: number }
  return {
    raffles: raffles.map((r) => (r.status === 'live' ? { ...r, entries_count: members } : r)),
    stats: { users, members, live: raffles.filter((r) => r.status === 'live').length },
  }
})

export const adminGetRaffle = createServerFn({ method: 'GET' })
  .validator((d: { id: string }) => ({ id: String(d.id) }))
  .handler(async ({ data }) => {
    requireAdmin()
    const raffle = (db.prepare('SELECT * FROM raffles WHERE id = ?').get(data.id) as Raffle) ?? null
    // Drawn raffles keep the list of who took part; until then it is whoever is an active member right now.
    const entrants =
      raffle?.status === 'drawn'
        ? (db
            .prepare(
              `SELECT e.user_id, u.email, u.full_name FROM entries e
               JOIN users u ON u.id = e.user_id
               WHERE e.raffle_id = ? ORDER BY e.created_date, e.rowid`,
            )
            .all(data.id) as RaffleEntrant[])
        : activeMembers()
    return { raffle, entrants }
  })

function validateRaffle(d: RaffleInput): RaffleInput {
  const num = (v: unknown, label: string, min: number) => {
    const n = Number(v)
    if (!Number.isFinite(n) || n < min) throw new Error(`${label} debe ser al menos ${min}.`)
    return n
  }
  if (!(d.game in GAME_LABELS)) throw new Error('Elige un juego.')
  const prize_name = String(d.prize_name ?? '').trim()
  if (!prize_name) throw new Error('Ponle un nombre al premio.')
  if (d.status !== 'draft' && d.status !== 'live') throw new Error('El estado debe ser borrador o activo.')

  let draws_at: string | null = null
  if (d.draws_at) {
    const t = new Date(d.draws_at)
    if (Number.isNaN(t.getTime())) throw new Error('La fecha del sorteo no es válida.')
    draws_at = t.toISOString()
  }
  if (d.status === 'live') {
    if (!draws_at) throw new Error('Define una fecha de sorteo antes de publicar.')
    if (new Date(draws_at).getTime() <= Date.now()) throw new Error('La fecha del sorteo debe ser futura.')
  }

  const prize_image = String(d.prize_image ?? '').trim()
  if (prize_image && !/^(https:\/\/|\/uploads\/)/.test(prize_image)) {
    throw new Error('La imagen debe ser un archivo subido o un enlace https://.')
  }

  return {
    id: d.id ? String(d.id) : undefined,
    game: d.game,
    prize_name: prize_name.slice(0, 160),
    kicker: String(d.kicker ?? '').trim().slice(0, 60),
    prize_image,
    retail_value: num(d.retail_value, 'El valor comercial', 0),
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
      draws_at: data.draws_at,
      status: data.status,
      updated_date: ts,
    }

    if (data.id) {
      const existing = db.prepare('SELECT status FROM raffles WHERE id = ?').get(data.id) as
        | { status: string }
        | undefined
      if (!existing) throw new Error('Sorteo no encontrado.')
      if (existing.status === 'drawn') throw new Error('Este sorteo ya se realizó y no se puede editar.')
      db.prepare(
        `UPDATE raffles SET game = @game, prize_name = @prize_name, kicker = @kicker, prize_image = @prize_image,
           retail_value = @retail_value,
           draws_at = @draws_at, status = @status, updated_date = @updated_date
         WHERE id = @id`,
      ).run({ ...fields, id: data.id })
      return { id: data.id }
    }

    const id = newId()
    db.prepare(
      `INSERT INTO raffles (id, game, prize_name, kicker, prize_image, retail_value, entry_cost_points,
         draws_at, status, entries_count, created_date, updated_date)
       VALUES (@id, @game, @prize_name, @kicker, @prize_image, @retail_value, 0,
         @draws_at, @status, 0, @created_date, @updated_date)`,
    ).run({ ...fields, id, created_date: ts })
    return { id }
  })

export const deleteRaffle = createServerFn({ method: 'POST' })
  .validator((d: { id: string }) => ({ id: String(d.id) }))
  .handler(async ({ data }) => {
    requireAdmin()
    const raffle = db.prepare('SELECT status FROM raffles WHERE id = ?').get(data.id) as { status: string } | undefined
    if (raffle?.status === 'drawn') throw new Error('Este sorteo ya se realizó y no se puede eliminar.')
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
    if (!(d instanceof FormData)) throw new Error('Se esperaba un archivo.')
    const file = d.get('file')
    if (!(file instanceof File)) throw new Error('Elige una imagen para subir.')
    return file
  })
  .handler(async ({ data: file }) => {
    requireAdmin()
    const ext = IMAGE_TYPES[file.type]
    if (!ext) throw new Error('Sube una imagen JPG, PNG, WebP o GIF.')
    if (file.size > MAX_IMAGE_BYTES) throw new Error('Las imágenes deben pesar 5 MB o menos.')
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
    const name = `${randomBytes(12).toString('hex')}.${ext}`
    fs.writeFileSync(path.join(UPLOADS_DIR, name), Buffer.from(await file.arrayBuffer()))
    return { url: `/uploads/${name}` }
  })
