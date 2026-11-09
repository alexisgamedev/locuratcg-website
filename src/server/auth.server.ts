import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server'
import { db, newId, now } from './db.server'
import type { User } from '@/lib/types'

const SESSION_COOKIE = 'pc_session'
const SESSION_DAYS = 30

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const a = Buffer.from(hash, 'hex')
  const b = scryptSync(password, salt, 64)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function startSession(userId: string) {
  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5)
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(
    token,
    userId,
    expires.toISOString(),
  )
  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires,
  })
}

export function endSession() {
  const token = getCookie(SESSION_COOKIE)
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
  deleteCookie(SESSION_COOKIE, { path: '/' })
}

/** The signed-in user for the current request, or null. */
export function currentUser(): User | null {
  const token = getCookie(SESSION_COOKIE)
  if (!token) return null
  const row = db
    .prepare(
      `SELECT u.id, u.email, u.full_name FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`,
    )
    .get(token, now()) as User | undefined
  return row ?? null
}

export function requireUser(): User {
  const user = currentUser()
  if (!user) throw new Error('Please sign in first.')
  return user
}

export function createUser(email: string, password: string, fullName: string): User {
  const id = newId()
  db.prepare(
    'INSERT INTO users (id, email, full_name, password_hash, created_date) VALUES (?, ?, ?, ?, ?)',
  ).run(id, email, fullName, hashPassword(password), now())
  return { id, email, full_name: fullName }
}
