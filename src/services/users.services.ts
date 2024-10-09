// import { comparePassword, hashPassword } from '@/utils/crypto'
// import User from '@/models/schemas/User.schema'
// import databaseService from './database.services'
// import { LoginReqBody, LogoutReqBody, RegisterReqBody } from '@/models/requests/Users.requests'
// import { signToken, verifyToken } from '@/utils/jwt'
// import { TokenType } from '@/constants/enum'
// import RefreshToken from '@/models/schemas/RefreshToken.schema'
// import { ObjectId } from 'mongodb'
// import { ResponseWrapper } from '@/models/response/ResponseWrapper'
// import { USERS_MESSAGES } from '@/constants/messages'
// import { HTTP_STATUS } from '@/constants/httpStatus'
// import { config } from 'dotenv'
// import { verify } from 'crypto'

// config()
// class UsersService {
//   private signAccessToken(user_id: string) {
//     return signToken({
//       payload: {
//         user_id,
//         token_type: TokenType.AccessToken
//       },
//       options: {
//         expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
//       }
//     })
//   }
//   private signRefreshToken(user_id: string) {
//     return signToken({
//       payload: {
//         user_id,
//         token_type: TokenType.RefreshToken
//       },
//       options: {
//         expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
//       }
//     })
//   }
//   private async handleVerifyToken(token: string, isRefreshToken = false) {
//     const tokenSlice = token.includes('Bearer') ? token.split(' ')[1] : token
//     try {
//       return await verifyToken({ token: tokenSlice })
//     } catch {
//       throw ResponseWrapper.error(
//         isRefreshToken ? USERS_MESSAGES.INVALID_REFRESH_TOKEN : USERS_MESSAGES.INVALID_ACCESS_TOKEN,
//         HTTP_STATUS.UNAUTHORIZED
//       )
//     }
//   }

//   private verifyAccessToken(access_token: string) {
//     return this.handleVerifyToken(access_token)
//   }

//   private verifyRefreshToken(refresh_token: string) {
//     return this.handleVerifyToken(refresh_token, true)
//   }
//   private signAccessTokenAndRefreshToken(user_id: string) {
//     return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
//   }
//   private verifyAccessTokenAndRefreshToken({ access_token, refresh_token }: LogoutReqBody) {
//     return Promise.all([this.verifyAccessToken(access_token), this.verifyRefreshToken(refresh_token)])
//   }
//   constructor() {}

//   async register(payload: RegisterReqBody) {
//     const hashedPassword = await hashPassword(payload.password)
//     if (!hashedPassword) {
//       throw ResponseWrapper.error(USERS_MESSAGES.PASSWORDS_DO_NOT_MATCH, HTTP_STATUS.BAD_REQUEST)
//     }
//     const user = await databaseService.users.findOne({ email: payload.email })
//     if (user) {
//       throw ResponseWrapper.error(USERS_MESSAGES.EMAIL_TAKEN, HTTP_STATUS.CONFLICT)
//     }

//     const result = await databaseService.users.insertOne(
//       new User({
//         ...payload,
//         date_of_birth: new Date(payload.date_of_birth),
//         password: hashedPassword
//       })
//     )
//     //Create Token
//     const user_id = result.insertedId.toString()
//     const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id)
//     //Save token to DB

//     await databaseService.refreshTokens.insertOne(
//       new RefreshToken({
//         user_id: new ObjectId(user_id),
//         token: refresh_token
//       })
//     )
//     const data = {
//       access_token,
//       refresh_token
//     }
//     return ResponseWrapper.success(data, USERS_MESSAGES.REGISTER_SUCCESS, HTTP_STATUS.OK)
//   }

//   async login(payload: LoginReqBody) {
//     const user = await databaseService.users.findOne({ email: payload.email })

//     if (!user) {
//       throw ResponseWrapper.error(USERS_MESSAGES.EMAIL_NOTFOUND, HTTP_STATUS.NOT_FOUND)
//     }

//     const cpw = await comparePassword(payload.password, user.password)
//     if (!cpw) {
//       throw ResponseWrapper.error(USERS_MESSAGES.PASSWORDS_DO_NOT_MATCH, HTTP_STATUS.BAD_REQUEST)
//     }

//     const user_id = user._id.toString()

//     const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id)

//     // Lưu refresh token vào database
//     await databaseService.refreshTokens.insertOne(
//       new RefreshToken({
//         user_id: new ObjectId(user_id),
//         token: refresh_token
//       })
//     )
//     const data = {
//       access_token,
//       refresh_token
//     }
//     return ResponseWrapper.success(data, USERS_MESSAGES.LOGIN_SUCCESS, HTTP_STATUS.OK)
//   }

//   async logout(payload: LogoutReqBody) {
//     const [[decoded_access, decoded_refresh], refresh_token] = await Promise.all([
//       this.verifyAccessTokenAndRefreshToken(payload),
//       databaseService.refreshTokens.findOne({ token: payload.refresh_token + 'sds' })
//     ])
//     console.log(decoded_access)
//     console.log(refresh_token)
//     console.log(decoded_refresh)
//     if (!refresh_token) {
//       throw ResponseWrapper.error(USERS_MESSAGES.NOT_FOUND_REFRESH_TOKEN, HTTP_STATUS.CONFLICT)
//     }
//     return ResponseWrapper.error(USERS_MESSAGES.EMAIL_TAKEN, HTTP_STATUS.CONFLICT)
//   }
// }

// const usersService = new UsersService()
// export default usersService

import { hashPassword } from '@/utils/crypto'
import User from '@/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '@/models/requests/Users.requests'
import { ObjectId } from 'mongodb'
import { ResponseWrapper } from '@/models/response/ResponseWrapper'
import { USERS_MESSAGES } from '@/constants/messages'
import { HTTP_STATUS } from '@/constants/httpStatus'
import RefreshToken from '@/models/schemas/RefreshToken.schema'
import tokenService from './token.services'

class UserService {
  async register(payload: RegisterReqBody) {
    const hashedPassword = await hashPassword(payload.password)
    if (!hashedPassword) {
      throw ResponseWrapper.error(USERS_MESSAGES.PASSWORDS_DO_NOT_MATCH, HTTP_STATUS.BAD_REQUEST)
    }

    const user = await databaseService.users.findOne({ email: payload.email })
    if (user) {
      throw ResponseWrapper.error(USERS_MESSAGES.EMAIL_TAKEN, HTTP_STATUS.CONFLICT)
    }

    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashedPassword
      })
    )

    const user_id = result.insertedId.toString()
    const [access_token, refresh_token] = await tokenService.signAccessTokenAndRefreshToken(user_id)

    // Lưu token vào database
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
    return ResponseWrapper.success(data, USERS_MESSAGES.REGISTER_SUCCESS, HTTP_STATUS.OK)
  }
}

const userService = new UserService()
export default userService
