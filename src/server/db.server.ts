import './env.server'
import { Db } from './sqlite.server'
import { randomBytes } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import seedRaffles from './seed-raffles.json'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  full_name TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  created_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS password_resets (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS raffles (
  id TEXT PRIMARY KEY,
  game TEXT NOT NULL,
  prize_name TEXT NOT NULL,
  kicker TEXT,
  prize_image TEXT,
  retail_value REAL NOT NULL DEFAULT 0,
  entry_cost_points INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'live',
  draws_at TEXT,
  entries_count INTEGER NOT NULL DEFAULT 0,
  entry_goal INTEGER NOT NULL DEFAULT 500,
  winner_name TEXT,
  winner_initials TEXT,
  winner_tier TEXT,
  draw_note TEXT,
  created_date TEXT NOT NULL,
  updated_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  points_balance INTEGER NOT NULL DEFAULT 0,
  monthly_points INTEGER NOT NULL,
  current_period_end TEXT,
  created_date TEXT NOT NULL,
  updated_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  raffle_id TEXT NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  raffle_title TEXT NOT NULL,
  game TEXT NOT NULL,
  tickets INTEGER NOT NULL,
  points_spent INTEGER NOT NULL,
  created_date TEXT NOT NULL,
  updated_date TEXT NOT NULL,
  UNIQUE (user_id, raffle_id)
);

CREATE TABLE IF NOT EXISTS point_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_charge_id TEXT,
  status TEXT NOT NULL,
  created_date TEXT NOT NULL
);
`

export function newId() {
  return randomBytes(12).toString('hex')
}

export function now() {
  return new Date().toISOString()
}

const DB_FILE = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'pullclub.db')

/** Uploaded prize images live next to the database, so they're kept on the same disk/volume. */
export const UPLOADS_DIR = path.join(path.dirname(DB_FILE), 'uploads')

function open() {
  const file = DB_FILE
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const db = new Db(file)
  db.exec(SCHEMA)

  // First run: load the raffles that were on the original site.
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM raffles').get() as { n: number }
  if (n === 0) {
    const insert = db.prepare(`
      INSERT INTO raffles (id, game, prize_name, kicker, prize_image, retail_value, entry_cost_points,
        status, draws_at, entries_count, entry_goal, winner_name, winner_initials, winner_tier, draw_note,
        created_date, updated_date)
      VALUES (@id, @game, @prize_name, @kicker, @prize_image, @retail_value, @entry_cost_points,
        @status, @draws_at, @entries_count, @entry_goal, @winner_name, @winner_initials, @winner_tier, @draw_note,
        @created_date, @updated_date)`)
    const ts = now()
    db.transaction(() => {
      for (const r of seedRaffles) insert.run({ ...r, created_date: ts, updated_date: ts })
    })()
  }
  return db
}

// Reuse one connection across hot reloads in dev.
const g = globalThis as unknown as { __pullClubDb?: Db }
export const db = g.__pullClubDb ?? (g.__pullClubDb = open())
