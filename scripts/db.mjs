// Shared helper for the CLI scripts. Run `npm run dev` once first so the schema exists.
import Database from 'better-sqlite3'
import { randomBytes } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const file = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'pullclub.db')
if (!fs.existsSync(file)) {
  console.error(`No database at ${file}. Start the app once with "npm run dev" to create it.`)
  process.exit(1)
}
export const db = new Database(file)
db.pragma('foreign_keys = ON')
export const newId = () => randomBytes(12).toString('hex')
export const now = () => new Date().toISOString()
