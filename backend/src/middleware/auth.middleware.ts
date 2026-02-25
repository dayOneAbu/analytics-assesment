import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { AuthenticatedRequest } from '../types'

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
 const authReq = req as AuthenticatedRequest
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      Success: false,
      Message: 'Unauthorized',
      Object: null,
      Errors: ['No token provided']
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; role: string }
    authReq.user = { id: payload.sub, role: payload.role as any }
    next()
  } catch {
    return res.status(401).json({
      Success: false,
      Message: 'Unauthorized',
      Object: null,
      Errors: ['Invalid or expired token']
    })
  }
}

export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
   const authReq = req as AuthenticatedRequest

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; role: string }
    authReq.user = { id: payload.sub, role: payload.role as any }
  } catch {
    // silently ignore
  }

  next()
}