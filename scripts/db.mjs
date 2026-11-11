// Shared helper for the CLI scripts. Run `npm run dev` once first so the schema exists.
import { DatabaseSync } from 'node:sqlite'
import { randomBytes } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const file = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'pullclub.db')
if (!fs.existsSync(file)) {
  console.error(`No database at ${file}. Start the app once with "npm run dev" to create it.`)
  process.exit(1)
}
const conn = new DatabaseSync(file)
conn.exec('PRAGMA foreign_keys = ON')
conn.exec('PRAGMA busy_timeout = 5000')

const plain = (row) => (row ? { ...row } : undefined)
export const db = {
  prepare(sql) {
    const stmt = conn.prepare(sql)
    return {
      get: (...a) => plain(stmt.get(...a)),
      all: (...a) => stmt.all(...a).map(plain),
      run: (...a) => stmt.run(...a),
    }
  },
  transaction(fn) {
    return () => {
      conn.exec('BEGIN IMMEDIATE')
      try {
        const r = fn()
        conn.exec('COMMIT')
        return r
      } catch (e) {
        conn.exec('ROLLBACK')
        throw e
      }
    }
  },
}
export const newId = () => randomBytes(12).toString('hex')
export const now = () => new Date().toISOString()
