import express from 'express'
import authRouter from "./src/module/auth/auth.router"
const app = express()
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' })
})

app.use('/auth', authRouter)
export default app