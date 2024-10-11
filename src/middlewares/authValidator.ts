import { TokenType } from '@/constants/enum'
import { HTTP_STATUS } from '@/constants/httpStatus'
import { USERS_MESSAGES } from '@/constants/messages'
import { ResponseWrapper } from '@/models/response/ResponseWrapper'
import databaseService from '@/services/databaseService'
import tokenService from '@/services/tokenService'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

export const accessTokenValidator = checkSchema(
  {
    authorization: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.REQUIRED_ACCESS_TOKEN
      },
      custom: {
        options: async (value, { req }) => {
          const decoded = await tokenService.handleVerifyToken(value)
          if (decoded.token_type !== TokenType.AccessToken) {
            throw ResponseWrapper.error(USERS_MESSAGES.INVALID_TOKEN, HTTP_STATUS.INTERNAL_SERVER_ERROR)
          }
          const user = await databaseService.users.findOne({
            _id: new ObjectId(decoded.user_id)
          })
          if (!user) {
            throw ResponseWrapper.error(USERS_MESSAGES.USER_NOTFOUND, HTTP_STATUS.NOT_FOUND)
          }
          req.user = user
          req.decode = decoded
          return true
        }
      }
    }
  },

  ['headers']
)
export const refreshTokenValidator = checkSchema(
  {
    refresh_token: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.REQUIRED_REFRESH_TOKEN
      }
    }
  },

  ['body']
)
export const queryTokenValidator = checkSchema(
  {
    token: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.REQUIRED_ACCESS_TOKEN
      },
      custom: {
        options: async (value, { req }) => {
          const decoded = await tokenService.handleVerifyToken(value)
          const user = await databaseService.users.findOne({
            _id: new ObjectId(decoded.user_id)
          })
          if (!user) {
            throw ResponseWrapper.error(USERS_MESSAGES.USER_NOTFOUND, HTTP_STATUS.NOT_FOUND)
          }

          req.user = user
          req.decode = decoded
          req.token = value
          return true
        }
      }
    }
  },
  ['query']
)
