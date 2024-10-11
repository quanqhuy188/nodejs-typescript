import express from 'express'
import databaseService from '@/services/databaseService'
import { defaultErrorHandler } from './middlewares/defaultErrorHandler'
import usersRouter from './routes/usersRoutes'
import authRouter from './routes/authRoutes'

const app = express()
const port = 8080

app.use(express.json())
app.use('/users', usersRouter)
app.use('/api', authRouter)
app.use(defaultErrorHandler)
databaseService.connect()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
