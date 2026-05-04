import { Router, Response } from 'express'
import { AuthService, AppError } from './auth.service'
// import { loginRateLimit } from './auth.middleware'  // TODO: enable rate limiting

export const authRouter = Router()
const authService = new AuthService()

function handleError(err: unknown, res: Response): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
  } else {
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * POST /auth/register
 * Body: { email: string, password: string }
 * Returns: { userId, email, createdAt }
 * Status 409 if email already exists
 */
authRouter.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await authService.register(email, password)
    res.status(201).json(result)
  } catch (err) {
    handleError(err, res)
  }
})

/**
 * POST /auth/login
 * Body: { email: string, password: string }
 * Returns: { accessToken, refreshToken, expiresIn }
 * Status 401 if invalid credentials
 * Status 423 if user is locked
 * Status 429 if rate limit exceeded
 *
 * TODO: add loginRateLimit middleware to this route
 */
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await authService.login(email, password)
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
})

/**
 * POST /auth/refresh
 * Body: { refreshToken: string }
 * Returns: { accessToken, refreshToken }
 * Status 401 if refresh token is invalid or expired
 */
authRouter.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body
    const result = await authService.refresh(refreshToken)
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
})

/**
 * POST /auth/logout
 * Body: { refreshToken: string }
 * Status 204 on success
 */
authRouter.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body
    await authService.logout(refreshToken)
    res.status(204).send()
  } catch (err) {
    handleError(err, res)
  }
})
