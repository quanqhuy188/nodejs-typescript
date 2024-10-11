import { TokenType, UserVerifyStatus } from '@/constants/enum'
import { HTTP_STATUS } from '@/constants/httpStatus'
import { USERS_MESSAGES } from '@/constants/messages'
import { ResponseWrapper } from '@/models/response/ResponseWrapper'
import databaseService from '@/services/databaseService'
import tokenService from '@/services/tokenService'
import { NextFunction, Request, Response } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { JwtPayload } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  isStrongPassword: {
    errorMessage: USERS_MESSAGES.WEAK_PASSWORD,
    options: {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      returnScore: false,
      pointsPerUnique: 1,
      pointsPerRepeat: 0.5,
      pointsForContainingLower: 10,
      pointsForContainingUpper: 10,
      pointsForContainingNumber: 10,
      pointsForContainingSymbol: 10
    }
  }
}
const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  custom: {
    options: (value, { req }) => {
      const passwordField = req.body.password || req.body.new_password

      if (passwordField && value !== passwordField) {
        throw ResponseWrapper.error(USERS_MESSAGES.PASSWORDS_DO_NOT_MATCH, HTTP_STATUS.BAD_REQUEST)
      }

      return true
    }
  },
  isStrongPassword: {
    errorMessage: USERS_MESSAGES.WEAK_PASSWORD,
    options: {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      returnScore: false,
      pointsPerUnique: 1,
      pointsPerRepeat: 0.5,
      pointsForContainingLower: 10,
      pointsForContainingUpper: 10,
      pointsForContainingNumber: 10,
      pointsForContainingSymbol: 10
    }
  }
}
const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
  },
  isLength: {
    errorMessage: USERS_MESSAGES.NAME_LENGTH,
    options: {
      min: 1,
      max: 50
    }
  },
  trim: true
}
export const loginValidator = checkSchema(
  {
    email: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
      },
      isEmail: {
        errorMessage: USERS_MESSAGES.INVALID_EMAIL
      },
      trim: true
    },
    password: passwordSchema
  },
  ['body']
)

export const logoutValidator = checkSchema({
  authorization: {
    notEmpty: {
      errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
    },
    custom: {
      options: async (value, { req }) => {
        const decoded = await tokenService.handleVerifyToken(value)
        if (decoded.token_type !== TokenType.AccessToken) {
          throw ResponseWrapper.error(USERS_MESSAGES.INVALID_TOKEN, HTTP_STATUS.INTERNAL_SERVER_ERROR)
        }
        req.decode = decoded
        return true
      }
    }
  },
  token: {
    notEmpty: {
      errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
    },
    custom: {
      options: async (value, { req }) => {
        const decoded = await tokenService.handleVerifyToken(value)
        if (decoded.token_type !== TokenType.RefreshToken) {
          throw ResponseWrapper.error(USERS_MESSAGES.INVALID_TOKEN, HTTP_STATUS.INTERNAL_SERVER_ERROR)
        }
        req.decode = decoded
        return true
      }
    }
  }
})
export const registerValidator = checkSchema(
  {
    name: nameSchema,
    email: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
      },
      isEmail: {
        errorMessage: USERS_MESSAGES.INVALID_EMAIL
      },
      trim: true
    },
    password: passwordSchema,
    confirm_password: confirmPasswordSchema,
    date_of_birth: {
      isISO8601: {
        errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_INVALID,
        options: {
          strict: true,
          strictSeparator: true
        }
      }
    }
  },
  ['body']
)

export const forgotPasswordValidator = checkSchema(
  {
    email: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
      }
    }
  },

  ['body']
)
export const resetPasswordValidator = checkSchema({
  new_password: passwordSchema,
  new_confirm_password: confirmPasswordSchema,
  token: {
    notEmpty: {
      errorMessage: USERS_MESSAGES.REQUIRED_ACCESS_TOKEN
    },
    custom: {
      options: async (value, { req }) => {
        const decoded = await tokenService.handleVerifyToken(value)
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
        req.decode = decoded
        req.user = user
        return true
      }
    }
  }
})
export const verifiedUserValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decode as JwtPayload
  if (verify !== UserVerifyStatus.Verified) {
    next(ResponseWrapper.error(USERS_MESSAGES.UNVERIFIED_USER, HTTP_STATUS.FORBIDDEN))
  } else {
    next()
  }
}
export const updateMeValidator = checkSchema({
  name: {
    ...nameSchema,
    optional: true,
    isEmpty: undefined
  }
})
