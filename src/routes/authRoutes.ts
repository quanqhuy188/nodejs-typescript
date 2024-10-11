import { oauthController } from '@/controllers/usersController'
import { wrapRequestHandler } from '@/helpers/handlers'
import { Router } from 'express'

const authRouter = Router()

authRouter.get('/oauth/google/', wrapRequestHandler(oauthController))
export default authRouter
