import { loginController, registerController } from '@/controllers/users.controllers'
import { loginValidator, registerValidator, validateResults } from '@/middlewares/users.middlewares'
import { wrapRequestHandler } from '@/utils/handlers'
import { Router } from 'express'
const usersRouter = Router()

usersRouter.post('/login', loginValidator, validateResults, wrapRequestHandler(loginController))

usersRouter.post('/register', registerValidator, validateResults, wrapRequestHandler(registerController))

export default usersRouter
