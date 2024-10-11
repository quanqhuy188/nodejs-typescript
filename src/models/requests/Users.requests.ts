import { JwtPayload } from 'jsonwebtoken'
import User from '../schemas/User.schema'

export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}
export interface LoginReqBody {
  email: string
  password: string
}

export interface LogoutReqBody {
  access_token: string
  refresh_token: string
}
export interface ResetPasswordReqBody {
  new_password: string
  user: User
  decode: JwtPayload
}
