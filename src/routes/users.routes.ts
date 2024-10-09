import { loginController, registerController, logoutController } from '@/controllers/users.controllers'
import {
  loginValidator,
  registerValidator,
  accessTokenValidator,
  refreshTokenValidator,
  validateResults
} from '@/middlewares/users.middlewares'
import { wrapRequestHandler } from '@/utils/handlers'
import { Router } from 'express'
const usersRouter = Router()
/*
 * Description: Login user
 * Path /login
 * Method: POST
 * Body:{email:string,password:string}
 */
usersRouter.post('/login', loginValidator, validateResults, wrapRequestHandler(loginController))
/*
 * Description: Register user
 * Path /register
 * Method: POST
 * Body:{email:string,password:string,confirm_password:string,date_of_birth:ISO}
 */
usersRouter.post('/register', registerValidator, validateResults, wrapRequestHandler(registerController))
/*
 * Description: logout user
 * Path /logout
 * Method: POST
 * Header : {Authorization: Bearer <access_token>}
 * Body:{refresh_token:string}
 */
usersRouter.post(
  '/logout',
  accessTokenValidator,
  refreshTokenValidator,
  validateResults,
  wrapRequestHandler(logoutController)
)

export default usersRouter
