import databaseService from './databaseService'
import { LoginReqBody, LogoutReqBody, RegisterReqBody } from '@/models/requests/Users.requests'
import { ObjectId } from 'mongodb'
import { ResponseWrapper } from '@/models/response/ResponseWrapper'
import { USERS_MESSAGES } from '@/constants/messages'
import { HTTP_STATUS } from '@/constants/httpStatus'
import RefreshToken from '@/models/schemas/RefreshToken.schema'

import { comparePassword, hashPassword } from '@/helpers/crypto'
import tokenService from './tokenService'
import { UserVerifyStatus } from '@/constants/enum'
import User from '@/models/schemas/User.schema'
import emailService from './emailService'

class UserService {
  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 }
      }
    )
    return ResponseWrapper.success(user, USERS_MESSAGES.SUCCESS, HTTP_STATUS.OK)
  }
}

const userService = new UserService()
export default userService
