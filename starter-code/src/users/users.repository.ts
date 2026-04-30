import { getDatabase } from '../database'

export interface User {
  id: string
  email: string
  passwordHash: string
  failedAttempts: number
  lockedUntil: string | null
  createdAt: string
}

export class UsersRepository {
  /**
   * Finds a user by email. Returns null if not found.
   */
  findByEmail(email: string): User | null {
    // TODO: implement
    // const db = getDatabase()
    // const row = db.prepare('SELECT ...').get(email)
    // return row ? mapRow(row) : null
    throw new Error('not implemented')
  }

  /**
   * Finds a user by ID. Returns null if not found.
   */
  findById(id: string): User | null {
    // TODO: implement
    throw new Error('not implemented')
  }

  /**
   * Creates a new user with a pre-hashed password.
   * Generates a UUID for the user ID.
   * @throws Error if email already exists (unique constraint)
   */
  create(data: { email: string; passwordHash: string }): User {
    // TODO: implement
    // const db = getDatabase()
    // const id = crypto.randomUUID()
    // db.prepare('INSERT INTO users ...').run(id, data.email, data.passwordHash)
    // return this.findById(id)!
    throw new Error('not implemented')
  }

  /**
   * Updates failed attempt counter and lock status after a failed login.
   */
  updateFailedAttempts(
    userId: string,
    failedAttempts: number,
    lockedUntil: string | null,
  ): void {
    // TODO: implement
    throw new Error('not implemented')
  }

  /**
   * Persists a refresh token linked to a user.
   */
  saveRefreshToken(token: string, userId: string, expiresAt: string): void {
    // TODO: implement
    throw new Error('not implemented')
  }

  /**
   * Finds a refresh token record. Returns null if not found.
   */
  findRefreshToken(token: string): { userId: string; expiresAt: string } | null {
    // TODO: implement
    throw new Error('not implemented')
  }

  /**
   * Deletes a refresh token (logout or rotation).
   */
  deleteRefreshToken(token: string): void {
    // TODO: implement
    throw new Error('not implemented')
  }
}
