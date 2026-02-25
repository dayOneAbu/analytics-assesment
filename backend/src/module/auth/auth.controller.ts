import { Request, Response } from 'express'
import { RegisterSchema, LoginSchema } from './auth.schema'
import { AuthService } from './auth.service'
import { formatZodErrors } from '../../lib/errors'

const authService = new AuthService()

export class AuthController {
  async register(req: Request, res: Response) {
    const parsed = RegisterSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        Success: false,
        Message: 'Validation failed',
        Object: null,
        Errors: formatZodErrors(parsed.error)
      })
    }

    try {
      const user = await authService.register(parsed.data)
      return res.status(201).json({
        Success: true,
        Message: 'User registered successfully',
        Object: user,
        Errors: null
      })
    } catch (err: any) {
      return res.status(err.status || 500).json({
        Success: false,
        Message: err.message || 'Internal server error',
        Object: null,
        Errors: [err.message]
      })
    }
  }

  async login(req: Request, res: Response) {
    const parsed = LoginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        Success: false,
        Message: 'Validation failed',
        Object: null,
        Errors: formatZodErrors(parsed.error)
      })
    }

    try {
      const result = await authService.login(parsed.data)
      return res.status(200).json({
        Success: true,
        Message: 'Login successful',
        Object: result,
        Errors: null
      })
    } catch (err: any) {
      return res.status(err.status || 500).json({
        Success: false,
        Message: err.message || 'Internal server error',
        Object: null,
        Errors: [err.message]
      })
    }
  }
}
