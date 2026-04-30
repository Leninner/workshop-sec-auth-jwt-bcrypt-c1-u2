import { Router } from 'express'
import { AuthService } from './auth.service'
import { loginRateLimit } from './auth.middleware'

export const authRouter = Router()
const authService = new AuthService()

/**
 * POST /auth/register
 * Body: { email: string, password: string }
 * Returns: { userId, email, createdAt }
 * Status 409 if email already exists
 */
authRouter.post('/register', async (req, res) => {
  // TODO: implement registration
  // 1. Extract and validate { email, password } from req.body
  // 2. Call authService.register(email, password)
  // 3. Return 201 with { userId, email, createdAt }
  // 4. On duplicate email, return 409
  res.status(501).json({ error: 'not implemented' })
})

/**
 * POST /auth/login
 * Body: { email: string, password: string }
 * Returns: { accessToken, refreshToken, expiresIn }
 * Status 401 if invalid credentials
 * Status 423 if user is locked
 * Status 429 if rate limit exceeded (handled by loginRateLimit middleware)
 *
 * Apply loginRateLimit middleware to this route.
 */
authRouter.post('/login', /* TODO: add loginRateLimit here */ async (req, res) => {
  // TODO: implement login
  // 1. Call authService.login(email, password)
  // 2. Return 200 with { accessToken, refreshToken, expiresIn }
  // 3. On invalid credentials, return 401
  // 4. On locked user, return 423
  res.status(501).json({ error: 'not implemented' })
})

/**
 * POST /auth/refresh
 * Body: { refreshToken: string }
 * Returns: { accessToken, refreshToken }
 * Status 401 if refresh token is invalid or expired
 */
authRouter.post('/refresh', async (req, res) => {
  // TODO: implement token rotation
  // 1. Extract refreshToken from req.body
  // 2. Call authService.refresh(refreshToken)
  // 3. Return 200 with new { accessToken, refreshToken }
  // 4. On invalid token, return 401
  res.status(501).json({ error: 'not implemented' })
})

/**
 * POST /auth/logout
 * Body: { refreshToken: string }
 * Status 204 on success
 */
authRouter.post('/logout', async (req, res) => {
  // TODO: implement logout
  // 1. Extract refreshToken from req.body
  // 2. Call authService.logout(refreshToken)
  // 3. Return 204
  res.status(501).json({ error: 'not implemented' })
})
