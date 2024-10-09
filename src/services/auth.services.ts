import databaseService from './database.services'
import { LoginReqBody, LogoutReqBody } from '@/models/requests/Users.requests'
import { ObjectId } from 'mongodb'
import { ResponseWrapper } from '@/models/response/ResponseWrapper'
import { USERS_MESSAGES } from '@/constants/messages'
import { HTTP_STATUS } from '@/constants/httpStatus'
import RefreshToken from '@/models/schemas/RefreshToken.schema'

import { comparePassword } from '@/utils/crypto'
import tokenService from './token.services'

class AuthService {
  async login(payload: LoginReqBody) {
    const user = await databaseService.users.findOne({ email: payload.email })

    if (!user) {
      throw ResponseWrapper.error(USERS_MESSAGES.EMAIL_NOTFOUND, HTTP_STATUS.NOT_FOUND)
    }

    const cpw = await comparePassword(payload.password, user.password)
    if (!cpw) {
      throw ResponseWrapper.error(USERS_MESSAGES.PASSWORDS_DO_NOT_MATCH, HTTP_STATUS.BAD_REQUEST)
    }

    const user_id = user._id.toString()
    const [access_token, refresh_token] = await tokenService.signAccessTokenAndRefreshToken(user_id)

    // Lưu refresh token vào database
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )

    const data = {
      access_token,
      refresh_token
    }
    return ResponseWrapper.success(data, USERS_MESSAGES.LOGIN_SUCCESS, HTTP_STATUS.OK)
  }

  async logout(payload: LogoutReqBody) {
    const [[decoded_access, decoded_refresh], refresh_token] = await Promise.all([
      tokenService.verifyAccessTokenAndRefreshToken(payload.access_token, payload.refresh_token),
      databaseService.refreshTokens.findOne({ token: payload.refresh_token })
    ])

    if (!refresh_token) {
      throw ResponseWrapper.error(USERS_MESSAGES.NOT_FOUND_REFRESH_TOKEN, HTTP_STATUS.CONFLICT)
    }
    console.log(decoded_access)
    console.log(decoded_refresh)
    console.log(refresh_token)
    //Delete refresh token
    const result = await databaseService.refreshTokens.deleteOne({ token: refresh_token.token })
    return ResponseWrapper.success(result, USERS_MESSAGES.LOGOUT_SUCCESS, HTTP_STATUS.OK)
  }
}

const authService = new AuthService()
export default authService
