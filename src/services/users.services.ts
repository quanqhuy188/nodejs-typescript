import { comparePassword, hashPassword } from '@/utils/crypto'
import User from '@/models/schemas/User.schema'
import databaseService from './database.services'
import { LoginReqBody, RegisterReqBody } from '@/models/requests/Users.requests'
import { signToken } from '@/utils/jwt'
import { TokenType } from '@/constants/enum'
import RefreshToken from '@/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '@/models/Errors'
import { USERS_MESSAGES } from '@/constants/messages'
import { HTTP_STATUS } from '@/constants/httpStatus'

class UsersService {
  private signAccessToken(user_id: string) {
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
  private signRefreshToken(user_id: string) {
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
  private signAccessTokenAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }
  constructor() {}
  async register(payload: RegisterReqBody) {
    const hashedPassword = await hashPassword(payload.password)

    if (!hashedPassword) {
      throw new Error('Failed to hash the password.')
    }

    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashedPassword
      })
    )
    //Create Token
    const user_id = result.insertedId.toString()
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id)
    //Save token to DB
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )
    return {
      access_token,
      refresh_token
    }
  }
  async login(payload: LoginReqBody) {
    const result = await databaseService.users.findOne({ email: payload.email })

    if (!result) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.EMAIL_NOTFOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const cpw = await comparePassword(payload.password, result.password)
    if (!cpw) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.PASSWORDS_DO_NOT_MATCH,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const user_id = result._id.toString()
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id)

    // Lưu refresh token vào database
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )

    // Trả về access_token và refresh_token để lưu trên client
    return {
      status: 200,
      data: {
        user: result,
        access_token,
        refresh_token
      }
    }
  }
  async isExitedEmail(email: string) {
    const result = await databaseService.users.findOne({ email })
    return result
  }
}

const usersService = new UsersService()
export default usersService
