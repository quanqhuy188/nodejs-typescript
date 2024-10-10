import { HTTP_STATUS } from '@/constants/httpStatus'
import { USERS_MESSAGES } from '@/constants/messages'
import { ResponseWrapper } from '@/models/response/ResponseWrapper'

import { Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'

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
