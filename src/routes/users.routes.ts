import { loginController, registerController } from '@/controllers/users.controllers'
import { loginValidator, registerValidator, validateResults } from '@/middlewares/users.middlewares'
import { validate } from '@/utils/validation'
import { Router } from 'express'
const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)

usersRouter.post('/register', registerValidator, validateResults, registerController)

export default usersRouter
