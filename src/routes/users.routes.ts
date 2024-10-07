import { loginController, registerController } from '@/controllers/users.controllers'
import { loginValidator } from '@/middlewares/users.middlewares'
import { Router } from 'express'
const usersRouter = Router()

usersRouter.post('/', loginValidator, loginController)

usersRouter.post('/register', registerController)

export default usersRouter
