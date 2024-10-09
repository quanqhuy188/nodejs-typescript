import { HTTP_STATUS } from '@/constants/httpStatus'
import { USERS_MESSAGES } from '@/constants/messages'
import { ResponseWrapper } from '@/models/response/ResponseWrapper'

import { Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'

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
    password: {
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
  },
  ['body']
)
export const registerValidator = checkSchema(
  {
    name: {
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
    },
    email: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
      },
      isEmail: {
        errorMessage: USERS_MESSAGES.INVALID_EMAIL
      },
      trim: true
    },
    password: {
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
    },
    confirm_password: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
      },
      isString: {
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
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
    },
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
export const accessTokenValidator = checkSchema(
  {
    authorization: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.REQUIRED_ACCESS_TOKEN
      },
      custom: {
        options: async (value, { req }) => {
          const access_token = value.split(' ')[1]
          if (!access_token) {
            throw ResponseWrapper.error(USERS_MESSAGES.REQUIRED_ACCESS_TOKEN, HTTP_STATUS.BAD_REQUEST)
          }
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
export const validateResults = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)

  if (errors.isEmpty()) {
    return next()
  }

  const errorsObject = errors.mapped()
  const errorResponses: Record<string, { msg: string }> = {}

  for (const key in errorsObject) {
    const { msg } = errorsObject[key]

    if (typeof msg === 'string') {
      errorResponses[key] = { msg }
    } else if (msg instanceof ResponseWrapper) {
      errorResponses[key] = { msg: msg.message }
    }
  }
  const responseError = ResponseWrapper.error(USERS_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, errorResponses)
  return next(responseError)
}
