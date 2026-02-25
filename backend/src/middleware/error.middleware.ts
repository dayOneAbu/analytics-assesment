import { Request, Response, NextFunction } from 'express'

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err)

  return res.status(err.status || 500).json({
    Success: false,
    Message: err.message || 'Internal server error',
    Object: null,
    Errors: [err.message || 'Something went wrong']
  })
}