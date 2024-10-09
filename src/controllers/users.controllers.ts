import { LoginReqBody, RegisterReqBody } from '@/models/requests/Users.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import usersService from '@/services/users.services'
import { Request, Response, NextFunction } from 'express'
import User from '@/models/schemas/User.schema'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '@/constants/messages'
export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const { email, password } = req.body

  const result = await usersService.login(req.body)
  res.status(result.status).json(result)
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await usersService.register(req.body)
  res.status(200).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    data: result
  })
}
