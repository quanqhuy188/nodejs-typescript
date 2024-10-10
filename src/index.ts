import express from 'express'
import databaseService from '@/services/databaseService'
import { defaultErrorHandler } from './middlewares/defaultErrorHandler'
import usersRouter from './routes/usersRoutes'

const app = express()
const port = 8080

app.use(express.json())
app.use('/users', usersRouter)

app.use(defaultErrorHandler)
databaseService.connect()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
