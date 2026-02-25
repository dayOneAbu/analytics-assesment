import express from 'express'
import authRouter from "./src/module/auth/auth.router"
import articleRouter from "./src/module/articles/article.router"
import { errorHandler } from "./src/middleware/error.middleware"

const app = express()
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' })
})

app.use('/auth', authRouter)
app.use('/articles', articleRouter)
export default app