import { UsersRepository } from '../users/users.repository'

export class AuthService {
  private users = new UsersRepository()

  /**
   * Registers a new user with a bcrypt-hashed password.
   * @throws AppError(409) if email is already registered
   */
  async register(
    email: string,
    password: string,
  ): Promise<{ userId: string; email: string; createdAt: string }> {
    // TODO: implement
    // 1. Check this.users.findByEmail(email) — throw 409 if found
    // 2. Hash password with bcrypt (use saltRounds >= 10)
    // 3. Call this.users.create({ email, passwordHash })
    // 4. Return { userId, email, createdAt }
    throw new Error('not implemented')
  }

  /**
   * Authenticates a user and issues JWT + refresh token.
   * @throws AppError(401) if credentials are invalid
   * @throws AppError(423) if the user is locked (>= 5 consecutive failures)
   */
  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    // TODO: implement
    // 1. Find user by email → 401 if not found
    // 2. Check locked_until → 423 if still locked
    // 3. Verify password with bcrypt → 401 and increment failed_attempts if wrong
    //    Lock user for 30 min after 5 consecutive failures
    // 4. Reset failed_attempts on success
    // 5. Generate access token (JWT, expiresIn <= 15 min, signed with JWT_SECRET)
    // 6. Generate refresh token (random opaque string, 7-day expiry)
    // 7. Persist refresh token via this.users.saveRefreshToken(...)
    // 8. Return { accessToken, refreshToken, expiresIn }
    throw new Error('not implemented')
  }

  /**
   * Rotates a refresh token: invalidates the old one, issues new pair.
   * @throws AppError(401) if the refresh token is unknown or expired
   */
  async refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // TODO: implement
    // 1. Find token via this.users.findRefreshToken(refreshToken) → 401 if not found
    // 2. Check expiry → 401 if expired
    // 3. Delete old token: this.users.deleteRefreshToken(refreshToken)
    // 4. Issue new access token + new refresh token
    // 5. Persist new refresh token
    // 6. Return new { accessToken, refreshToken }
    throw new Error('not implemented')
  }

  /**
   * Invalidates a refresh token (logout).
   */
  async logout(refreshToken: string): Promise<void> {
    // TODO: implement
    // 1. Call this.users.deleteRefreshToken(refreshToken)
    throw new Error('not implemented')
  }
}
