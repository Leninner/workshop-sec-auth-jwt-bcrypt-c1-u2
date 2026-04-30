import express from 'express'
import { authRouter } from './auth/auth.controller'

const app = express()

app.use(express.json())
app.use('/auth', authRouter)

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

const PORT = parseInt(process.env.PORT || '3000', 10)

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

export { app }
