import express from 'express'
import authRouter from "./src/module/auth/auth.router"
import articleRouter from "./src/module/articles/article.router"
import analyticsRouter from './src/module/analytics/analytics.router'
import { errorHandler } from "./src/middleware/error.middleware"

const app = express()

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({
    Success: true,
    Message: 'Server is running',
    Object: null,
    Errors: null,
  })
})

app.use('/auth', authRouter)
app.use('/articles', articleRouter)
app.use('/author', analyticsRouter)
app.use(errorHandler)

export default app
