import { signToken, verifyToken } from '@/helpers/jwt'
import { TokenType, UserVerifyStatus } from '@/constants/enum'
import { USERS_MESSAGES } from '@/constants/messages'
import { HTTP_STATUS } from '@/constants/httpStatus'
import { ResponseWrapper } from '@/models/response/ResponseWrapper'
import { config } from 'dotenv'
import { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken'
import databaseService from './databaseService'
import { ObjectId } from 'mongodb'
import emailService from './emailService'
import { ResetPasswordReqBody } from '@/models/requests/Users.requests'
import { hashPassword } from '@/helpers/crypto'

config()

class TokenService {
  handleSignToken(user_id: string, token_type: TokenType, expiresIn: string) {
    return signToken({
      payload: {
        user_id,
        token_type
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
  async verifyEmailToken(token: string) {
    const decoded = await this.handleVerifyToken(token)
    if (decoded.token_type !== TokenType.EmailVerifyToken) {
      throw ResponseWrapper.error(USERS_MESSAGES.INVALID_TOKEN, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
    const user = await databaseService.users.findOne({
      _id: new ObjectId(decoded.user_id)
    })
    if (!user) {
      throw ResponseWrapper.error(USERS_MESSAGES.USER_NOTFOUND, HTTP_STATUS.NOT_FOUND)
    }
    if (user.verify === UserVerifyStatus.Verified) {
      throw ResponseWrapper.error(USERS_MESSAGES.VERIFIED_USER, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
    const result = await databaseService.users.updateOne(
      { _id: new ObjectId(decoded.user_id) },
      { $set: { verify: UserVerifyStatus.Verified }, $currentDate: { updated_at: true } }
    )
    return ResponseWrapper.success(result, USERS_MESSAGES.SUCCESS, HTTP_STATUS.OK)
  }
  async verifyForgotPasswordToken(token: string) {
    const decoded = await this.handleVerifyToken(token)
    if (decoded.token_type !== TokenType.ForgotPasswordToken) {
      throw ResponseWrapper.error(USERS_MESSAGES.INVALID_TOKEN, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
    const user = await databaseService.users.findOne({
      _id: new ObjectId(decoded.user_id)
    })

    if (!user) {
      throw ResponseWrapper.error(USERS_MESSAGES.USER_NOTFOUND, HTTP_STATUS.NOT_FOUND)
    }

    // await databaseService.users.updateOne(
    //   { _id: user._id },
    //   { $set: { forgot_password_token: '' }, $currentDate: { updated_at: true } }
    // )
    return ResponseWrapper.success(token, USERS_MESSAGES.SUCCESS, HTTP_STATUS.OK)
  }
  async resendVerifyEmailToken(access_token: string) {
    const decoded = await this.handleVerifyToken(access_token)
    const user = await databaseService.users.findOne({ _id: new ObjectId(decoded.user_id) })
    if (!user) {
      throw ResponseWrapper.error(USERS_MESSAGES.USER_NOTFOUND, HTTP_STATUS.NOT_FOUND)
    }
    if (user.verify === UserVerifyStatus.Verified) {
      throw ResponseWrapper.error(USERS_MESSAGES.VERIFIED_USER, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
    const result = await emailService.sendVerificationEmail(user._id.toString(), user.email, user.name)
    return ResponseWrapper.success(result, USERS_MESSAGES.SUCCESS, HTTP_STATUS.OK)
  }

  signAccessTokenAndRefreshToken(user_id: string) {
    return Promise.all([
      this.handleSignToken(user_id, TokenType.AccessToken, process.env.ACCESS_TOKEN_EXPIRES_IN as string),
      this.handleSignToken(user_id, TokenType.RefreshToken, process.env.REFRESH_TOKEN_EXPIRES_IN as string)
    ])
  }

  verifyAccessTokenAndRefreshToken(access_token: string, refresh_token: string) {
    return Promise.all([this.handleVerifyToken(access_token), this.handleVerifyToken(refresh_token)])
  }
  async verifyResetPasswordToken(payload: ResetPasswordReqBody) {
    const hashedPassword = await hashPassword(payload.new_password)
    if (!hashedPassword) {
      throw ResponseWrapper.error(USERS_MESSAGES.PASSWORDS_DO_NOT_MATCH, HTTP_STATUS.BAD_REQUEST)
    }
    const decoded = await this.handleVerifyToken(payload.token)
    if (decoded.token_type !== TokenType.ForgotPasswordToken) {
      throw ResponseWrapper.error(USERS_MESSAGES.INVALID_TOKEN, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    const user = await databaseService.users.findOne({
      _id: new ObjectId(decoded.user_id)
    })

    if (!user) {
      throw ResponseWrapper.error(USERS_MESSAGES.USER_NOTFOUND, HTTP_STATUS.NOT_FOUND)
    }
    if (user.forgot_password_token === '') {
      throw ResponseWrapper.error(USERS_MESSAGES.LINK_EXPIRED, HTTP_STATUS.BAD_REQUEST)
    }
    const result = await databaseService.users.updateOne(
      { _id: user._id },
      { $set: { forgot_password_token: '', password: hashPassword.toString() }, $currentDate: { updated_at: true } }
    )
    return ResponseWrapper.success(result, USERS_MESSAGES.SUCCESS, HTTP_STATUS.OK)
  }
}

const tokenService = new TokenService()
export default tokenService
