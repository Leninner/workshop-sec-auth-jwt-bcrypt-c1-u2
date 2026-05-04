import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import { UsersRepository } from '../users/users.repository'

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'AppError'
  }
}

const SALT_ROUNDS = 10
const ACCESS_TOKEN_TTL = 15 * 60 // 15 minutes in seconds
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export class AuthService {
  private users = new UsersRepository()

  async register(
    email: string,
    password: string,
  ): Promise<{ userId: string; email: string; createdAt: string }> {
    const existing = this.users.findByEmail(email)
    if (existing) throw new AppError(409, 'Email already registered')

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const user = this.users.create({ email, passwordHash })

    return { userId: user.id, email: user.email, createdAt: user.createdAt }
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const user = this.users.findByEmail(email)
    if (!user) throw new AppError(401, 'Invalid credentials')

    // TODO: check user.lockedUntil and throw AppError(423) if account is locked

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      // TODO: increment failed_attempts and lock after 5 consecutive failures
      throw new AppError(401, 'Invalid credentials')
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: ACCESS_TOKEN_TTL },
    )

    const refreshToken = randomBytes(40).toString('hex')
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS).toISOString()
    this.users.saveRefreshToken(refreshToken, user.id, expiresAt)

    return { accessToken, refreshToken, expiresIn: ACCESS_TOKEN_TTL }
  }

  async refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const record = this.users.findRefreshToken(refreshToken)
    if (!record) throw new AppError(401, 'Invalid refresh token')

    if (new Date(record.expiresAt) <= new Date()) {
      this.users.deleteRefreshToken(refreshToken)
      throw new AppError(401, 'Refresh token expired')
    }

    this.users.deleteRefreshToken(refreshToken)

    const user = this.users.findById(record.userId)!
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: ACCESS_TOKEN_TTL },
    )

    const newRefreshToken = randomBytes(40).toString('hex')
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS).toISOString()
    this.users.saveRefreshToken(newRefreshToken, user.id, expiresAt)

    return { accessToken, refreshToken: newRefreshToken }
  }

  async logout(refreshToken: string): Promise<void> {
    this.users.deleteRefreshToken(refreshToken)
  }
}
