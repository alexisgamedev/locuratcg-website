// Thin wrapper over Node's built-in SQLite (node:sqlite), with the small API the app uses:
// db.prepare(sql).get/all/run and db.transaction(fn). No native add-on to compile.
import { DatabaseSync } from 'node:sqlite'

type Params = Record<string, unknown> | unknown[]
type Value = null | number | bigint | string | NodeJS.ArrayBufferView

function bind(args: unknown[]): Value[] | [Record<string, Value>] {
  // Allow either positional args or a single object of named params.
  if (args.length === 1 && args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])) {
    return [args[0] as Record<string, Value>]
  }
  return args.map((a) => (a === undefined ? null : a)) as Value[]
}

// node:sqlite returns null-prototype objects; copy them into plain objects for serialization.
const plain = <T>(row: unknown) => (row ? ({ ...(row as object) } as T) : undefined)

export class Db {
  private conn: DatabaseSync
  private depth = 0

  constructor(file: string) {
    this.conn = new DatabaseSync(file)
    this.conn.exec('PRAGMA foreign_keys = ON')
    this.conn.exec('PRAGMA busy_timeout = 5000')
  }

  close() {
    this.conn.close()
  }

  exec(sql: string) {
    this.conn.exec(sql)
  }

  prepare(sql: string) {
    const stmt = this.conn.prepare(sql)
    return {
      get: <T = unknown>(...args: unknown[]) => plain<T>(stmt.get(...(bind(args) as Value[]))),
      all: <T = unknown>(...args: unknown[]) => stmt.all(...(bind(args) as Value[])).map((r) => plain<T>(r) as T),
      run: (...args: unknown[]) => stmt.run(...(bind(args) as Value[])),
    }
  }

  /** Returns a function that runs `fn` inside a transaction (rolled back if it throws). */
  transaction<T>(fn: () => T): () => T {
    return () => {
      if (this.depth > 0) return fn()
      this.conn.exec('BEGIN IMMEDIATE')
      this.depth++
      try {
        const result = fn()
        this.conn.exec('COMMIT')
        return result
      } catch (err) {
        this.conn.exec('ROLLBACK')
        throw err
      } finally {
        this.depth--
      }
    }
  }
}

export type { Params }
