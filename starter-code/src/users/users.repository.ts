import { getDatabase } from '../database'
import { randomUUID } from 'crypto'

export interface User {
  id: string
  email: string
  passwordHash: string
  failedAttempts: number
  lockedUntil: string | null
  createdAt: string
}

function mapRow(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    passwordHash: row.password_hash as string,
    failedAttempts: row.failed_attempts as number,
    lockedUntil: row.locked_until as string | null,
    createdAt: row.created_at as string,
  }
}

const SELECT_COLS = 'id, email, password_hash, failed_attempts, locked_until, created_at'

export class UsersRepository {
  findByEmail(email: string): User | null {
    const db = getDatabase()
    const row = db.prepare(`SELECT ${SELECT_COLS} FROM users WHERE email = ?`).get(email)
    return row ? mapRow(row as Record<string, unknown>) : null
  }

  findById(id: string): User | null {
    const db = getDatabase()
    const row = db.prepare(`SELECT ${SELECT_COLS} FROM users WHERE id = ?`).get(id)
    return row ? mapRow(row as Record<string, unknown>) : null
  }

  create(data: { email: string; passwordHash: string }): User {
    const db = getDatabase()
    const id = randomUUID()
    db.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)').run(id, data.email, data.passwordHash)
    return this.findById(id)!
  }

  updateFailedAttempts(userId: string, failedAttempts: number, lockedUntil: string | null): void {
    const db = getDatabase()
    db.prepare('UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?').run(failedAttempts, lockedUntil, userId)
  }

  saveRefreshToken(token: string, userId: string, expiresAt: string): void {
    const db = getDatabase()
    db.prepare('INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt)
  }

  findRefreshToken(token: string): { userId: string; expiresAt: string } | null {
    const db = getDatabase()
    const row = db.prepare('SELECT user_id, expires_at FROM refresh_tokens WHERE token = ?').get(token)
    if (!row) return null
    const r = row as Record<string, unknown>
    return { userId: r.user_id as string, expiresAt: r.expires_at as string }
  }

  deleteRefreshToken(token: string): void {
    const db = getDatabase()
    db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(token)
  }
}
