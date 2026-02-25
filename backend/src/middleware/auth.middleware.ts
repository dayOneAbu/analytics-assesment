import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { JwtPayload } from 'jsonwebtoken'
import { UserRole } from '@prisma/client'
import { env } from '../config/env'
import { AuthenticatedRequest } from '../types'

const isUserRole = (role: unknown): role is UserRole => {
  return role === 'author' || role === 'reader'
}

const decodeAuthUser = (token: string): { id: string; role: UserRole } | null => {
  const payload = jwt.verify(token, env.JWT_SECRET)
  if (typeof payload === 'string') return null

  const jwtPayload = payload as JwtPayload & { role?: unknown }
  if (typeof jwtPayload.sub !== 'string' || !isUserRole(jwtPayload.role)) {
    return null
  }

  return { id: jwtPayload.sub, role: jwtPayload.role }
}

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
    const authUser = decodeAuthUser(token)
    if (!authUser) {
      return res.status(401).json({
        Success: false,
        Message: 'Unauthorized',
        Object: null,
        Errors: ['Invalid token payload'],
      })
    }
    authReq.user = authUser
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
    const authUser = decodeAuthUser(token)
    if (authUser) {
      authReq.user = authUser
    }
  } catch {
    // silently ignore
  }

  next()
}
