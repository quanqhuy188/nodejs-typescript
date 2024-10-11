import { signToken, verifyToken } from '@/helpers/jwt'
import { TokenType, UserVerifyStatus } from '@/constants/enum'
import { USERS_MESSAGES } from '@/constants/messages'
import { HTTP_STATUS } from '@/constants/httpStatus'
import { ResponseWrapper } from '@/models/response/ResponseWrapper'
import { config } from 'dotenv'
import { JsonWebTokenError, JwtPayload, NotBeforeError, TokenExpiredError } from 'jsonwebtoken'
import databaseService from './databaseService'
import { ObjectId } from 'mongodb'
import emailService from './emailService'
import { ResetPasswordReqBody } from '@/models/requests/Users.requests'
import { hashPassword } from '@/helpers/crypto'
import User from '@/models/schemas/User.schema'

config()

class TokenService {
  handleSignToken(user_id: string, token_type: TokenType, expiresIn: string, verify?: UserVerifyStatus) {
    return signToken({
      payload: {
        user_id,
        token_type,
        verify
      },
      options: {
        expiresIn
      }
    })
  }

  async handleVerifyToken(token: string) {
    const tokenSlice = token.includes('Bearer') ? token.split(' ')[1] : token
    try {
      return await verifyToken({ token: tokenSlice })
    } catch (error) {
      if (error instanceof NotBeforeError) {
        throw ResponseWrapper.error(USERS_MESSAGES.TOKEN_NOT_ACTIVE_YET, HTTP_STATUS.UNAUTHORIZED)
      } else if (error instanceof TokenExpiredError) {
        throw ResponseWrapper.error(USERS_MESSAGES.TOKEN_EXPIRED, HTTP_STATUS.UNAUTHORIZED)
      } else {
        throw ResponseWrapper.error(USERS_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED)
      }
    }
  }
  async verifyEmailToken(user: User, decode: JwtPayload) {
    if (decode.token_type !== TokenType.EmailVerifyToken) {
      throw ResponseWrapper.error(USERS_MESSAGES.INVALID_TOKEN, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
    if (user.verify === UserVerifyStatus.Verified) {
      throw ResponseWrapper.error(USERS_MESSAGES.VERIFIED_USER, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
    const result = await databaseService.users.updateOne(
      { _id: new ObjectId(user._id) },
      { $set: { verify: UserVerifyStatus.Verified }, $currentDate: { updated_at: true } }
    )
    return ResponseWrapper.success(result, USERS_MESSAGES.SUCCESS, HTTP_STATUS.OK)
  }
  async verifyForgotPasswordToken(token: string) {
    return ResponseWrapper.success(token, USERS_MESSAGES.SUCCESS, HTTP_STATUS.OK)
  }
  async resendVerifyEmailToken(user: User, decode: JwtPayload) {
    if (user.verify === UserVerifyStatus.Verified) {
      throw ResponseWrapper.error(USERS_MESSAGES.VERIFIED_USER, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
    const result = await emailService.sendVerificationEmail((user._id as ObjectId).toString(), user.email, user.name)
    return ResponseWrapper.success(result, USERS_MESSAGES.SUCCESS, HTTP_STATUS.OK)
  }

  signAccessTokenAndRefreshToken(user_id: string, verify: UserVerifyStatus) {
    return Promise.all([
      this.handleSignToken(user_id, TokenType.AccessToken, process.env.ACCESS_TOKEN_EXPIRES_IN as string, verify),
      this.handleSignToken(user_id, TokenType.RefreshToken, process.env.REFRESH_TOKEN_EXPIRES_IN as string, verify)
    ])
  }

  verifyAccessTokenAndRefreshToken(access_token: string, refresh_token: string) {
    return Promise.all([this.handleVerifyToken(access_token), this.handleVerifyToken(refresh_token)])
  }
  async verifyResetPasswordToken(payload: ResetPasswordReqBody) {
    console.log(payload)
    const hashedPassword = await hashPassword(payload.new_password)
    if (!hashedPassword) {
      throw ResponseWrapper.error(USERS_MESSAGES.PASSWORDS_DO_NOT_MATCH, HTTP_STATUS.BAD_REQUEST)
    }
    const result = await databaseService.users.updateOne(
      { _id: payload.user._id },
      { $set: { forgot_password_token: '', password: hashedPassword }, $currentDate: { updated_at: true } }
    )
    return ResponseWrapper.success(result, USERS_MESSAGES.SUCCESS, HTTP_STATUS.OK)
  }
}

const tokenService = new TokenService()
export default tokenService
