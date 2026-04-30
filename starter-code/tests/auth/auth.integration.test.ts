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
// Tests — write at least one test per scenario below
// ---------------------------------------------------------------------------

describe('POST /auth/register', () => {
  // TODO: successful registration returns 201 with { userId, email, createdAt }

  // TODO: duplicate email returns 409
})

describe('POST /auth/login', () => {
  // TODO: successful login returns 200 with { accessToken, refreshToken, expiresIn }

  // TODO: wrong password returns 401

  // TODO: unknown email returns 401

  // TODO: rate limiting — 6th request within 1 minute returns 429
  //   Hint: send 6 requests in a loop; the 6th should have status 429

  // TODO: account lockout — 5 consecutive wrong passwords lock the account;
  //   the 6th attempt (even with correct password) returns 423
})

describe('POST /auth/refresh', () => {
  // TODO: valid refresh token returns new { accessToken, refreshToken }
  //   and the old refresh token is no longer valid (replay attack prevention)

  // TODO: invalid or expired refresh token returns 401
})

describe('POST /auth/logout', () => {
  // TODO: logout invalidates the refresh token (subsequent refresh returns 401)
})
