import { LoginReqBody, LogoutReqBody, RegisterReqBody } from '@/models/requests/Users.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import usersService from '@/services/usersService'
import { Request, Response, NextFunction } from 'express'
import authService from '@/services/authService'
import tokenService from '@/services/tokenService'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const result = await authService.login(req.body)
  res.status(result.status).json(result)
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await authService.register(req.body)
  res.status(result.status).json(result)
}

export const logoutController = async (req: Request, res: Response) => {
  const payload: LogoutReqBody = {
    access_token: req.headers.authorization || '',
    refresh_token: req.body.refresh_token || ''
  }
  const result = await authService.logout(payload)
  res.status(result.status).json(result)
}
export const verifyEmailController = async (req: Request, res: Response) => {
  const token = (req.query.token as string) || ''
  const result = await tokenService.verifyEmailToken(token)
  res.status(result.status).json(result)
}
export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const access_token = req.headers.authorization || ''
  const result = await tokenService.resendVerifyEmailToken(access_token)
  res.status(200).json(result)
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  const email = req.body.email || ''
  const result = await authService.forgotPassword(email)
  res.status(200).json(result)
}
export const verifyForgotPasswordController = async (req: Request, res: Response) => {
  const token = (req.query.token as string) || ''
  const result = await tokenService.verifyForgotPasswordToken(token)
  res.status(result.status).json(result)
}
