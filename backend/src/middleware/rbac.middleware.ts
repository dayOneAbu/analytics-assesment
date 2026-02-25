import { Request, Response, NextFunction } from 'express'
import { UserRole } from '@prisma/client'
import { AuthenticatedRequest } from '../types'

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
     const authReq = req as AuthenticatedRequest
    if (!authReq.user) {
      return res.status(401).json({
        Success: false,
        Message: 'Unauthorized',
        Object: null,
        Errors: ['Not authenticated']
      })
    }

    if (!roles.includes(authReq.user.role as UserRole)) {
      return res.status(403).json({
        Success: false,
        Message: 'Forbidden',
        Object: null,
        Errors: ['You do not have permission to access this resource']
      })
    }

    next()
  }
}