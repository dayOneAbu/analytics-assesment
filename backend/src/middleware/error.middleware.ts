import { Request, Response, NextFunction } from 'express'
import { toSafeApiError } from '../lib/errors'

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err)
  const safeError = toSafeApiError(err)

  return res.status(safeError.status).json({
    Success: false,
    Message: safeError.message,
    Object: null,
    Errors: safeError.errors
  })
}
