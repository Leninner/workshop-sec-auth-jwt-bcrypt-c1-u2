// Set env vars before any imports so the app reads them on startup
process.env.DATABASE_URL = ':memory:'
process.env.JWT_SECRET = 'test-jwt-secret-for-integration-tests-only'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-integration-tests-only'

import request from 'supertest'
import { app } from '../../src/main'
import { closeDatabase } from '../../src/database'

afterAll(() => {
  closeDatabase()
})

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

const BASE = '/auth'

async function registerUser(email = 'user@test.com', password = 'SecurePass123!') {
  return request(app).post(`${BASE}/register`).send({ email, password })
}

async function loginUser(email = 'user@test.com', password = 'SecurePass123!') {
  return request(app).post(`${BASE}/login`).send({ email, password })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /auth/register', () => {
  it('successful registration returns 201 with { userId, email, createdAt }', async () => {
    const res = await registerUser('register-ok@test.com')
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      userId: expect.any(String),
      email: 'register-ok@test.com',
      createdAt: expect.any(String),
    })
  })

  it('duplicate email returns 409', async () => {
    await registerUser('duplicate@test.com')
    const res = await registerUser('duplicate@test.com')
    expect(res.status).toBe(409)
  })
})

describe('POST /auth/login', () => {
  it('successful login returns 200 with { accessToken, refreshToken, expiresIn }', async () => {
    await registerUser('login-ok@test.com')
    const res = await loginUser('login-ok@test.com')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      expiresIn: expect.any(Number),
    })
  })

  it('wrong password returns 401', async () => {
    await registerUser('wrong-pass@test.com')
    const res = await loginUser('wrong-pass@test.com', 'BadPassword999!')
    expect(res.status).toBe(401)
  })

  it('unknown email returns 401', async () => {
    const res = await loginUser('nobody@test.com')
    expect(res.status).toBe(401)
  })

  it('rate limiting — 6th request within 1 minute returns 429', async () => {
    await registerUser('rate-limit@test.com')
    let lastRes: request.Response = null as unknown as request.Response
    for (let i = 0; i < 6; i++) {
      lastRes = await loginUser('rate-limit@test.com')
    }
    expect(lastRes.status).toBe(429)
  })

  it('account lockout — 5 consecutive wrong passwords lock the account; the 6th attempt (even with correct password) returns 423', async () => {
    await registerUser('lockout@test.com')
    for (let i = 0; i < 5; i++) {
      await loginUser('lockout@test.com', 'WrongPassword999!')
    }
    const res = await loginUser('lockout@test.com', 'SecurePass123!')
    expect(res.status).toBe(423)
  })
})

describe('POST /auth/refresh', () => {
  it('valid refresh token returns new { accessToken, refreshToken } and the old refresh token is no longer valid (replay attack prevention)', async () => {
    await registerUser('refresh-ok@test.com')
    const loginRes = await loginUser('refresh-ok@test.com')
    const { refreshToken } = loginRes.body

    const refreshRes = await request(app).post(`${BASE}/refresh`).send({ refreshToken })
    expect(refreshRes.status).toBe(200)
    expect(refreshRes.body).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    })
    expect(refreshRes.body.refreshToken).not.toBe(refreshToken)

    // Replaying the old token must be rejected
    const replayRes = await request(app).post(`${BASE}/refresh`).send({ refreshToken })
    expect(replayRes.status).toBe(401)
  })

  it('invalid or expired refresh token returns 401', async () => {
    const res = await request(app).post(`${BASE}/refresh`).send({ refreshToken: 'totally-invalid-token' })
    expect(res.status).toBe(401)
  })
})

describe('POST /auth/logout', () => {
  it('logout invalidates the refresh token (subsequent refresh returns 401)', async () => {
    await registerUser('logout-ok@test.com')
    const loginRes = await loginUser('logout-ok@test.com')
    const { refreshToken } = loginRes.body

    const logoutRes = await request(app).post(`${BASE}/logout`).send({ refreshToken })
    expect(logoutRes.status).toBe(204)

    const refreshRes = await request(app).post(`${BASE}/refresh`).send({ refreshToken })
    expect(refreshRes.status).toBe(401)
  })
})
