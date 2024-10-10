import { Request, Response, NextFunction } from 'express'
export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status).json(err)
}
