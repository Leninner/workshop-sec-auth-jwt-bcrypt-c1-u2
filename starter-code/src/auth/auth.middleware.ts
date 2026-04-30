import { Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'

/**
 * Rate limiting middleware for POST /auth/login.
 * Allows a maximum of 5 requests per minute per IP.
 * Responds with 429 and the Retry-After header when the limit is exceeded.
 *
 * TODO: configure the options below to meet the requirements:
 *   - windowMs: time window in milliseconds
 *   - max: maximum requests per window
 *   - message: response body sent on 429
 *   - standardHeaders: include RateLimit-* headers (RFC 6585)
 */
export const loginRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
})

/**
 * JWT verification middleware.
 * Checks the Authorization: Bearer <token> header, verifies the signature,
 * and attaches the decoded payload to req.user on success.
 *
 * TODO: implement JWT verification
 *   1. Extract the token from the Authorization header
 *   2. Verify with jwt.verify(token, process.env.JWT_SECRET!)
 *   3. Attach the decoded payload to (req as any).user
 *   4. Return 401 with { error: 'Unauthorized' } if the token is missing or invalid
 */
export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  // TODO: implement
  res.status(501).json({ error: 'not implemented' })
}
