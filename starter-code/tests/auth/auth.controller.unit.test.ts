import request from 'supertest'
import express from 'express'
import { authRouter } from '../../src/auth/auth.controller'
import { AuthService, AppError } from '../../src/auth/auth.service'

jest.mock('../../src/auth/auth.service', () => {
  const { AppError } = jest.requireActual('../../src/auth/auth.service')
  const AuthService = jest.fn()
  AuthService.prototype.register = jest.fn()
  AuthService.prototype.login = jest.fn()
  AuthService.prototype.refresh = jest.fn()
  AuthService.prototype.logout = jest.fn()
  return { AppError, AuthService }
})

const MockAuthService = AuthService as jest.MockedClass<typeof AuthService>

const app = express()
app.use(express.json())
app.use('/auth', authRouter)

beforeEach(() => {
  jest.resetAllMocks()
})

// ---------------------------------------------------------------------------
// POST /auth/register
// ---------------------------------------------------------------------------

describe('POST /auth/register', () => {
  it('returns 201 with { userId, email, createdAt } on success', async () => {
    const payload = { userId: 'abc-123', email: 'new@test.com', createdAt: '2024-01-01T00:00:00.000Z' }
    MockAuthService.prototype.register.mockResolvedValue(payload)

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'new@test.com', password: 'SecurePass123!' })

    expect(res.status).toBe(201)
    expect(res.body).toEqual(payload)
  })

  it('returns 409 when email is already registered', async () => {
    MockAuthService.prototype.register.mockRejectedValue(new AppError(409, 'Email already registered'))

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'dup@test.com', password: 'SecurePass123!' })

    expect(res.status).toBe(409)
    expect(res.body).toEqual({ error: 'Email already registered' })
  })

  it('returns 500 on unexpected error', async () => {
    MockAuthService.prototype.register.mockRejectedValue(new Error('unexpected'))

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'x@test.com', password: 'pass' })

    expect(res.status).toBe(500)
  })
})

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------

describe('POST /auth/login', () => {
  it('returns 200 with { accessToken, refreshToken, expiresIn } on success', async () => {
    const tokens = { accessToken: 'jwt-token', refreshToken: 'refresh-token', expiresIn: 900 }
    MockAuthService.prototype.login.mockResolvedValue(tokens)

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@test.com', password: 'SecurePass123!' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual(tokens)
  })

  it('returns 401 on invalid credentials', async () => {
    MockAuthService.prototype.login.mockRejectedValue(new AppError(401, 'Invalid credentials'))

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@test.com', password: 'wrong' })

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'Invalid credentials' })
  })

  it('returns 423 when account is locked', async () => {
    MockAuthService.prototype.login.mockRejectedValue(new AppError(423, 'Account temporarily locked'))

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'locked@test.com', password: 'SecurePass123!' })

    expect(res.status).toBe(423)
  })
})

// ---------------------------------------------------------------------------
// POST /auth/refresh
// ---------------------------------------------------------------------------

describe('POST /auth/refresh', () => {
  it('returns 200 with new { accessToken, refreshToken } on valid token', async () => {
    const tokens = { accessToken: 'new-jwt', refreshToken: 'new-refresh' }
    MockAuthService.prototype.refresh.mockResolvedValue(tokens)

    const res = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: 'valid-token' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual(tokens)
  })

  it('returns 401 on invalid or expired refresh token', async () => {
    MockAuthService.prototype.refresh.mockRejectedValue(new AppError(401, 'Invalid refresh token'))

    const res = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: 'bad-token' })

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'Invalid refresh token' })
  })
})

// ---------------------------------------------------------------------------
// POST /auth/logout
// ---------------------------------------------------------------------------

describe('POST /auth/logout', () => {
  it('returns 204 and deletes the refresh token', async () => {
    MockAuthService.prototype.logout.mockResolvedValue(undefined)

    const res = await request(app)
      .post('/auth/logout')
      .send({ refreshToken: 'some-token' })

    expect(res.status).toBe(204)
    expect(MockAuthService.prototype.logout).toHaveBeenCalledWith('some-token')
  })
})
