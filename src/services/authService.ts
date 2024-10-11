import databaseService from './databaseService'
import { LoginReqBody, LogoutReqBody, RegisterReqBody } from '@/models/requests/Users.requests'
import { ObjectId, UUID } from 'mongodb'
import { ResponseWrapper } from '@/models/response/ResponseWrapper'
import { USERS_MESSAGES } from '@/constants/messages'
import { HTTP_STATUS } from '@/constants/httpStatus'
import RefreshToken from '@/models/schemas/RefreshToken.schema'
import { v4 as uuidv4 } from 'uuid'

import { comparePassword, hashPassword } from '@/helpers/crypto'
import tokenService from './tokenService'
import { UserVerifyStatus } from '@/constants/enum'
import User from '@/models/schemas/User.schema'
import emailService from './emailService'
import { config } from 'dotenv'
import axios from 'axios'
config()
class AuthService {
  async login(payload: LoginReqBody) {
    const user = await databaseService.users.findOne({ email: payload.email })

    if (!user) {
      throw ResponseWrapper.error(USERS_MESSAGES.EMAIL_NOTFOUND, HTTP_STATUS.NOT_FOUND)
    }
    if (user.verify === UserVerifyStatus.Unverified) {
      throw ResponseWrapper.error(USERS_MESSAGES.UNVERIFIED_USER, HTTP_STATUS.BAD_REQUEST)
    }
    if (user.verify === UserVerifyStatus.Banned) {
      throw ResponseWrapper.error(USERS_MESSAGES.BANNED_USER, HTTP_STATUS.BAD_REQUEST)
    }
    const cpw = await comparePassword(payload.password, user.password)
    if (!cpw) {
      throw ResponseWrapper.error(USERS_MESSAGES.PASSWORDS_DO_NOT_MATCH, HTTP_STATUS.BAD_REQUEST)
    }

    const user_id = user._id.toString()
    const [access_token, refresh_token] = await tokenService.signAccessTokenAndRefreshToken(user_id, user.verify)

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
    const refresh_token = await databaseService.refreshTokens.findOne({ token: payload.refresh_token })
    if (!refresh_token) {
      throw ResponseWrapper.error(USERS_MESSAGES.NOT_FOUND_REFRESH_TOKEN, HTTP_STATUS.CONFLICT)
    }
    const result = await databaseService.refreshTokens.deleteOne({ token: refresh_token.token })
    return ResponseWrapper.success(result, USERS_MESSAGES.LOGOUT_SUCCESS, HTTP_STATUS.OK)
  }
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
    const [access_token, refresh_token] = await tokenService.signAccessTokenAndRefreshToken(
      user_id,
      UserVerifyStatus.Unverified
    )
    // Lưu token vào database
    Promise.all([
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({
          user_id: new ObjectId(user_id),
          token: refresh_token
        })
      ),
      await emailService.sendVerificationEmail(user_id, payload.email, payload.email)
    ])
    const data = {
      access_token,
      refresh_token
    }
    return ResponseWrapper.success(data, USERS_MESSAGES.REGISTER_SUCCESS, HTTP_STATUS.OK)
  }
  async forgotPassword(email: string) {
    const user = await databaseService.users.findOne({ email: email })
    if (!user) {
      throw ResponseWrapper.error(USERS_MESSAGES.EMAIL_NOTFOUND, HTTP_STATUS.NOT_FOUND)
    }
    //Update verify token for user
    const result = await emailService.sendForgotPasswordEmail(user._id.toString(), email, user.name)

    await databaseService.users.updateOne(
      { _id: user._id },
      { $set: { forgot_password_token: result }, $currentDate: { updated_at: true } }
    )
    return ResponseWrapper.success(result, USERS_MESSAGES.SUCCESS, HTTP_STATUS.OK)
  }
  async resetPassword() {}

  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    return data
  }
  private async getOauthGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: { access_token, alt: 'json' },
      headers: { Authorization: `Bearer ${id_token}` }
    })
    return data
  }
  async oauth(code: string) {
    const { access_token, id_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getOauthGoogleUserInfo(access_token, id_token)
    console.log(userInfo)
    if (!userInfo.verified_email) {
      throw ResponseWrapper.error(USERS_MESSAGES.UNVERIFIED_USER, HTTP_STATUS.BAD_REQUEST)
    }
    const user = await databaseService.users.findOne({ email: userInfo.email })
    if (user) {
      const [access_token, refresh_token] = await tokenService.signAccessTokenAndRefreshToken(
        user._id.toString(),
        user.verify
      )
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({
          user_id: user._id,
          token: refresh_token
        })
      )
      const data = {
        access_token,
        refresh_token
      }
      return ResponseWrapper.success(data, USERS_MESSAGES.LOGIN_SUCCESS, HTTP_STATUS.OK)
    } else {
      const result = await databaseService.users.insertOne(
        new User({ email: userInfo.email, name: userInfo.name, password: uuidv4(), verify: UserVerifyStatus.Verified })
      )
      const user_id = result.insertedId.toString()
      const [access_token, refresh_token] = await tokenService.signAccessTokenAndRefreshToken(
        user_id,
        UserVerifyStatus.Verified
      )
      const data = {
        access_token,
        refresh_token
      }
      return ResponseWrapper.success(data, USERS_MESSAGES.REGISTER_SUCCESS, HTTP_STATUS.OK)
    }
  }
}

const authService = new AuthService()
export default authService
