import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import { AuthService, AppError } from '../../src/auth/auth.service'
import { UsersRepository } from '../../src/users/users.repository'

jest.mock('bcryptjs')
jest.mock('jsonwebtoken')
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomBytes: jest.fn(),
}))
jest.mock('../../src/users/users.repository')

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>
const mockJwt = jwt as jest.Mocked<typeof jwt>
const mockRandomBytes = randomBytes as jest.Mock
const MockRepo = UsersRepository as jest.MockedClass<typeof UsersRepository>

const MOCK_USER = {
  id: 'user-123',
  email: 'test@example.com',
  passwordHash: 'hashed-password',
  failedAttempts: 0,
  lockedUntil: null,
  createdAt: '2024-01-01T00:00:00.000Z',
}

const FUTURE_EXPIRY = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

let service: AuthService

beforeEach(() => {
  jest.resetAllMocks()
  process.env.JWT_SECRET = 'test-secret'
  mockRandomBytes.mockReturnValue({ toString: () => 'mock-hex-token' })
  service = new AuthService()
})

// ---------------------------------------------------------------------------
// register
// ---------------------------------------------------------------------------

describe('AuthService.register', () => {
  it('returns userId, email, createdAt on success', async () => {
    MockRepo.prototype.findByEmail.mockReturnValue(null)
    MockRepo.prototype.create.mockReturnValue(MOCK_USER)
    mockBcrypt.hash.mockResolvedValue('hashed-password' as never)

    const result = await service.register('test@example.com', 'SecurePass123!')

    expect(result).toEqual({
      userId: 'user-123',
      email: 'test@example.com',
      createdAt: '2024-01-01T00:00:00.000Z',
    })
    expect(MockRepo.prototype.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      passwordHash: 'hashed-password',
    })
  })

  it('throws AppError(409) when email is already registered', async () => {
    MockRepo.prototype.findByEmail.mockReturnValue(MOCK_USER)

    await expect(service.register('test@example.com', 'SecurePass123!')).rejects.toMatchObject({
      statusCode: 409,
    })
    expect(MockRepo.prototype.create).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// login
// ---------------------------------------------------------------------------

describe('AuthService.login', () => {
  it('returns accessToken, refreshToken, expiresIn on valid credentials', async () => {
    MockRepo.prototype.findByEmail.mockReturnValue(MOCK_USER)
    mockBcrypt.compare.mockResolvedValue(true as never)
    mockJwt.sign.mockReturnValue('mock-access-token' as never)

    const result = await service.login('test@example.com', 'SecurePass123!')

    expect(result).toMatchObject({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-hex-token',
      expiresIn: expect.any(Number),
    })
    expect(MockRepo.prototype.saveRefreshToken).toHaveBeenCalledWith(
      'mock-hex-token',
      'user-123',
      expect.any(String),
    )
  })

  it('throws AppError(401) when user is not found', async () => {
    MockRepo.prototype.findByEmail.mockReturnValue(null)

    await expect(service.login('nobody@example.com', 'pass')).rejects.toMatchObject({
      statusCode: 401,
    })
  })

  it('throws AppError(401) when password does not match', async () => {
    MockRepo.prototype.findByEmail.mockReturnValue(MOCK_USER)
    mockBcrypt.compare.mockResolvedValue(false as never)

    await expect(service.login('test@example.com', 'WrongPass!')).rejects.toMatchObject({
      statusCode: 401,
    })
  })
})

// ---------------------------------------------------------------------------
// refresh
// ---------------------------------------------------------------------------

describe('AuthService.refresh', () => {
  it('returns new accessToken and refreshToken, and deletes the old token', async () => {
    MockRepo.prototype.findRefreshToken.mockReturnValue({ userId: 'user-123', expiresAt: FUTURE_EXPIRY })
    MockRepo.prototype.findById.mockReturnValue(MOCK_USER)
    mockJwt.sign.mockReturnValue('new-access-token' as never)

    const result = await service.refresh('old-token')

    expect(result).toMatchObject({
      accessToken: 'new-access-token',
      refreshToken: 'mock-hex-token',
    })
    expect(MockRepo.prototype.deleteRefreshToken).toHaveBeenCalledWith('old-token')
    expect(MockRepo.prototype.saveRefreshToken).toHaveBeenCalledWith(
      'mock-hex-token',
      'user-123',
      expect.any(String),
    )
  })

  it('throws AppError(401) when token is not found', async () => {
    MockRepo.prototype.findRefreshToken.mockReturnValue(null)

    await expect(service.refresh('invalid-token')).rejects.toMatchObject({
      statusCode: 401,
    })
  })

  it('throws AppError(401) and deletes the token when it is expired', async () => {
    const expiredAt = new Date(Date.now() - 1000).toISOString()
    MockRepo.prototype.findRefreshToken.mockReturnValue({ userId: 'user-123', expiresAt: expiredAt })

    await expect(service.refresh('expired-token')).rejects.toMatchObject({
      statusCode: 401,
    })
    expect(MockRepo.prototype.deleteRefreshToken).toHaveBeenCalledWith('expired-token')
  })
})

// ---------------------------------------------------------------------------
// logout
// ---------------------------------------------------------------------------

describe('AuthService.logout', () => {
  it('deletes the refresh token', async () => {
    await service.logout('some-token')

    expect(MockRepo.prototype.deleteRefreshToken).toHaveBeenCalledWith('some-token')
  })
})
