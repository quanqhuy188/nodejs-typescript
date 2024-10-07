import { RegisterReqBody } from '@/models/requests/Users.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import usersService from '@/services/users.services'
import { Request, Response } from 'express'
export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'quanqhuy188@gmail.com' && password === '123') {
    res.status(200).json({
      message: 'Login success'
    })
  }
  res.status(400).json({
    message: 'Login failed'
  })
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  try {
    const result = await usersService.register(req.body)
    res.status(200).json({
      message: 'success',
      data: result
    })
  } catch (error) {
    res.status(400).json({
      message: 'error',
      error: error
    })
  }
}
