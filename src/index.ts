import usersRouter from '@/routes/users.routes'
import express from 'express'
import databaseService from '@/services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'

const app = express()
const port = 8080

app.use(express.json())
app.use('/users', usersRouter)

app.use(defaultErrorHandler)
databaseService.connect()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
