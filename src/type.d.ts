import User from '@/models/schemas/User.schema'
import { JwtPayload } from 'jsonwebtoken'

declare module 'express' {
  interface Request {
    user?: User
    decode?: JwtPayload
    token?: string
  }
}
