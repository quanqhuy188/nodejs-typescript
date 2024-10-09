import { LoginReqBody, LogoutReqBody, RegisterReqBody } from '@/models/requests/Users.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import usersService from '@/services/users.services'
import { Request, Response, NextFunction } from 'express'

import authService from '@/services/auth.services'
export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const result = await authService.login(req.body)
  res.status(result.status).json(result)
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await usersService.register(req.body)
  res.status(result.status).json(result)
}

export const logoutController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const payload: LogoutReqBody = {
    access_token: req.headers.authorization || '',
    refresh_token: req.body.refresh_token || ''
  }
  const result = await authService.logout(payload)
  res.status(result.status).json(result)
}
