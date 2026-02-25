import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'
 
import { RegisterInput, LoginInput } from './auth.schema'
import { env } from '../../config/env'
import { prisma } from '../../lib/prisma'

export class AuthService {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      throw { status: 409, message: 'Email already in use' }
    }

    const hashedPassword = await argon2.hash(data.password)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    })

    return user
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } })
    if (!user) {
      throw { status: 401, message: 'Invalid credentials' }
    }

    const valid = await argon2.verify(user.password, data.password)
    if (!valid) {
      throw { status: 401, message: 'Invalid credentials' }
    }

    const signOptions: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      env.JWT_SECRET,
      signOptions
    )

    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
  }
}
