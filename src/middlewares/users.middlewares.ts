import { HTTP_STATUS } from '@/constants/httpStatus'
import { USERS_MESSAGES } from '@/constants/messages'
import { EntityError, ErrorWithStatus } from '@/models/Errors'
import usersService from '@/services/users.services'
import { comparePassword } from '@/utils/crypto'
import { Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'

export const loginValidator = checkSchema({
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
})
export const registerValidator = checkSchema({
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
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.PASSWORDS_DO_NOT_MATCH,
            status: HTTP_STATUS.BAD_REQUEST
          })
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
})

export const validateResults = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    next()
  } else {
    const errorsObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        next(msg)
      }
      entityError.errors[key] = errorsObject[key]
    }
    next(entityError)
  }
}
