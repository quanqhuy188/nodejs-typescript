import User from '@/models/schemas/User.schema'
import databaseService from '@/services/database.services'
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
export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const result = await usersService.register({ email, password })
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
