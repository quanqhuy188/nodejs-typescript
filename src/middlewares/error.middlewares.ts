import { HTTP_STATUS } from '@/constants/httpStatus'
import { ErrorWithStatus } from '@/models/Errors'
import express, { Request, Response, NextFunction } from 'express'
import { omit } from 'lodash'
export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorWithStatus) {
    res.status(err.status).json(omit(err, 'status'))
  }

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message
  })
}
