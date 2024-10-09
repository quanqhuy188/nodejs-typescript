import { signToken, verifyToken } from '@/utils/jwt'
import { TokenType } from '@/constants/enum'
import { USERS_MESSAGES } from '@/constants/messages'
import { HTTP_STATUS } from '@/constants/httpStatus'
import { ResponseWrapper } from '@/models/response/ResponseWrapper'
import { config } from 'dotenv'
import { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken'

config()

class TokenService {
  signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }

  signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  async handleVerifyToken(token: string, isRefreshToken = false) {
    const tokenSlice = token.includes('Bearer') ? token.split(' ')[1] : token
    try {
      return await verifyToken({ token: tokenSlice })
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw ResponseWrapper.error(
          isRefreshToken ? USERS_MESSAGES.INVALID_TOKEN : USERS_MESSAGES.INVALID_TOKEN,
          HTTP_STATUS.UNAUTHORIZED
        )
      } else if (error instanceof NotBeforeError) {
        throw ResponseWrapper.error(USERS_MESSAGES.TOKEN_NOT_ACTIVE_YET, HTTP_STATUS.UNAUTHORIZED)
      } else if (error instanceof TokenExpiredError) {
        throw ResponseWrapper.error(USERS_MESSAGES.TOKEN_EXPIRED, HTTP_STATUS.UNAUTHORIZED)
      } else {
        throw ResponseWrapper.error(USERS_MESSAGES.INVALID_TOKEN, HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }
    }
  }

  verifyAccessToken(access_token: string) {
    return this.handleVerifyToken(access_token)
  }

  verifyRefreshToken(refresh_token: string) {
    return this.handleVerifyToken(refresh_token, true)
  }

  signAccessTokenAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  verifyAccessTokenAndRefreshToken(access_token: string, refresh_token: string) {
    return Promise.all([this.verifyAccessToken(access_token), this.verifyRefreshToken(refresh_token)])
  }
}

const tokenService = new TokenService()
export default tokenService
