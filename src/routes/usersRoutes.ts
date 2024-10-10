import {
  loginController,
  registerController,
  logoutController,
  verifyEmailController,
  resendVerifyEmailController,
  forgotPasswordController,
  verifyForgotPasswordController
} from '@/controllers/usersController'
import {
  loginValidator,
  registerValidator,
  accessTokenValidator,
  refreshTokenValidator,
  queryTokenValidator,
  forgotPasswordValidator
} from '@/middlewares/userValidator'
import { wrapRequestHandler } from '@/helpers/handlers'
import { validateResults } from '@/helpers/validateResults'
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
/*
 * Description: verify-email user
 * Path /verify-email
 * Method: GET
 * PARAMS: token
 */
usersRouter.get('/verify-email/', queryTokenValidator, validateResults, wrapRequestHandler(verifyEmailController))

/*
 * Description: resend verify-email user
 * Path /resend-verify-email
 * Method: POST
 * Body: access_token
 */
usersRouter.post(
  '/resend-verify-email',
  accessTokenValidator,
  validateResults,
  wrapRequestHandler(resendVerifyEmailController)
)
/*
 * Description: forgot password
 * Path /forgot-password
 * Method: POST
 * Body: email
 */
usersRouter.post(
  '/forgot-password',
  forgotPasswordValidator,
  validateResults,
  wrapRequestHandler(forgotPasswordController)
)
/*
 * Description: verify-email user
 * Path /verify-email
 * Method: GET
 * PARAMS: token
 */
usersRouter.get(
  '/verify-forgot-password/',
  queryTokenValidator,
  validateResults,
  wrapRequestHandler(verifyForgotPasswordController)
)
export default usersRouter
