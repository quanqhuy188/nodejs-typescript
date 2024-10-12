import express from 'express'
import databaseService from '@/services/databaseService'
import { defaultErrorHandler } from './middlewares/defaultErrorHandler'
import usersRouter from './routes/usersRoutes'
import authRouter from './routes/authRoutes'
import cors from 'cors'
const app = express()
const port = 8080

app.use(
  cors({
    origin: 'http://localhost:3000', // Cho phép yêu cầu từ origin này
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức HTTP mà bạn cho phép
    credentials: true // Nếu bạn muốn cho phép cookies
  })
)
app.use(express.json())
app.use('/users', usersRouter)
app.use('/api', authRouter)
app.use(defaultErrorHandler)
databaseService.connect()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
