import usersService from '@/services/users.services'
import { Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({
      error: 'Missing Enmail or Password'
    })
  }
  next()
}
export const registerValidator = checkSchema({
  name: {
    notEmpty: {
      errorMessage: 'Tên không được để trống'
    },
    isString: true,
    isLength: {
      errorMessage: 'Không được vượt quá 50 ký tự',
      options: {
        min: 1,
        max: 50
      }
    },
    trim: true
  },
  email: {
    notEmpty: {
      errorMessage: 'Tên không được để trống'
    },
    isEmail: true,
    trim: true,
    custom: {
      options: async (value, { req }) => {
        const isExitedEmail = await usersService.isExitedEmail(value)
        if (isExitedEmail) {
          throw new Error('Email đã tồn tại')
        }
      }
    }
  },
  password: {
    notEmpty: {
      errorMessage: 'Không được vượt quá 50 ký tự'
    },
    isString: true,
    isStrongPassword: {
      errorMessage: 'Không được vượt quá 50 ký tự',
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
      errorMessage: 'Không được vượt quá 50 ký tự'
    },
    isString: true,
    custom: {
      options: (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Mật khẩu không trùng khớp')
        }
        return true
      }
    },
    isStrongPassword: {
      errorMessage: 'Không được vượt quá 50 ký tự',
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
      errorMessage: 'Không được vượt quá 50 ký tự',
      options: {
        strict: true,
        strictSeparator: true
      }
    }
  }
})

export const validateResults = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  console.log(errors.array())

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.mapped() }) // Gửi phản hồi lỗi
  } else {
    next()
  }
}
