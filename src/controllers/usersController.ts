import { LoginReqBody, LogoutReqBody, RegisterReqBody, ResetPasswordReqBody } from '@/models/requests/Users.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response, NextFunction } from 'express'
import authService from '@/services/authService'
import tokenService from '@/services/tokenService'
import User from '@/models/schemas/User.schema'
import { JwtPayload } from 'jsonwebtoken'
import userService from '@/services/userService'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  try {
    const result = await authService.login(req.body)
    res.status(result.status).json(result)
  } catch (error) {
    res.status(500).json(error)
  }
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.register(req.body)
    res.status(result.status).json(result)
  } catch (error) {
    res.status(500).json(error)
  }
}

export const logoutController = async (req: Request, res: Response) => {
  const payload: LogoutReqBody = {
    access_token: req.headers.authorization || '',
    refresh_token: req.body.refresh_token || ''
  }
  try {
    const result = await authService.logout(payload)
    res.status(result.status).json(result)
  } catch (error) {
    res.status(500).json(error)
  }
}
export const verifyEmailController = async (req: Request, res: Response) => {
  try {
    const result = await tokenService.verifyEmailToken(req.user as User, req.decode as JwtPayload)
    res.status(result.status).json(result)
  } catch (error) {
    res.status(500).json(error)
  }
}
export const resendVerifyEmailController = async (req: Request, res: Response) => {
  try {
    const result = await tokenService.resendVerifyEmailToken(req.user as User, req.decode as JwtPayload)
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json(error)
  }
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  const email = req.body.email || ''
  try {
    const result = await authService.forgotPassword(email)
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json(error)
  }
}
export const verifyForgotPasswordController = async (req: Request, res: Response) => {
  try {
    const result = await tokenService.verifyForgotPasswordToken(req.token as string)
    res.redirect(`https://github.com/reset-password?token=${result?.data}`)
  } catch (error) {
    res.status(500).json(error)
  }
}
export const resetPasswordController = async (req: Request, res: Response) => {
  const payload: ResetPasswordReqBody = {
    new_password: req.body.new_password,
    decode: req.decode as JwtPayload,
    user: req.user as User
  }
  try {
    const result = await tokenService.verifyResetPasswordToken(payload)
    res.status(result.status).json(result)
  } catch (error) {
    res.status(500).json(error)
  }
}

export const meController = async (req: Request, res: Response) => {
  try {
    const result = await userService.getMe((req.decode as JwtPayload).user_id)
    res.status(result.status).json(result)
  } catch (error) {
    res.status(500).json(error)
  }
}
