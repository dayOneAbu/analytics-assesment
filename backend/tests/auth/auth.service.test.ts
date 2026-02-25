import assert from 'node:assert/strict'
import test from 'node:test'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { env } from '../../src/config/env'
import { prisma } from '../../src/lib/prisma'
import { AuthService } from '../../src/module/auth/auth.service'

const userDelegate = prisma.user as any

test('AuthService.register throws 409 when email already exists', async () => {
  const service = new AuthService()
  const originalFindUnique = userDelegate.findUnique

  userDelegate.findUnique = async () => ({ id: 'existing-user' })

  try {
    await assert.rejects(
      () =>
        service.register({
          name: 'Existing User',
          email: 'existing@example.com',
          password: 'Strong@123',
          role: 'reader',
        }),
      (error: any) => {
        assert.equal(error.status, 409)
        assert.equal(error.message, 'Email already in use')
        return true
      }
    )
  } finally {
    userDelegate.findUnique = originalFindUnique
  }
})

test('AuthService.register hashes password and creates user', async () => {
  const service = new AuthService()
  const originalFindUnique = userDelegate.findUnique
  const originalCreate = userDelegate.create
  const originalHash = (argon2 as any).hash

  let createArgs: any
  userDelegate.findUnique = async () => null
  userDelegate.create = async (args: any) => {
    createArgs = args
    return {
      id: 'new-user-id',
      name: args.data.name,
      email: args.data.email,
      role: args.data.role,
      createdAt: new Date('2026-02-25T00:00:00.000Z'),
    }
  }
  ;(argon2 as any).hash = async () => 'hashed-password'

  try {
    const result = await service.register({
      name: 'New User',
      email: 'new@example.com',
      password: 'Strong@123',
      role: 'author',
    })

    assert.equal(createArgs.data.password, 'hashed-password')
    assert.equal(result.email, 'new@example.com')
    assert.equal(result.role, 'author')
  } finally {
    userDelegate.findUnique = originalFindUnique
    userDelegate.create = originalCreate
    ;(argon2 as any).hash = originalHash
  }
})

test('AuthService.login throws 401 when user is not found', async () => {
  const service = new AuthService()
  const originalFindUnique = userDelegate.findUnique

  userDelegate.findUnique = async () => null

  try {
    await assert.rejects(
      () => service.login({ email: 'unknown@example.com', password: 'Strong@123' }),
      (error: any) => {
        assert.equal(error.status, 401)
        assert.equal(error.message, 'Invalid credentials')
        return true
      }
    )
  } finally {
    userDelegate.findUnique = originalFindUnique
  }
})

test('AuthService.login throws 401 when password is invalid', async () => {
  const service = new AuthService()
  const originalFindUnique = userDelegate.findUnique
  const originalVerify = (argon2 as any).verify

  userDelegate.findUnique = async () => ({
    id: 'user-1',
    name: 'Reader One',
    email: 'reader1@example.com',
    password: 'hashed-password',
    role: 'reader',
  })
  ;(argon2 as any).verify = async () => false

  try {
    await assert.rejects(
      () => service.login({ email: 'reader1@example.com', password: 'Wrong@123' }),
      (error: any) => {
        assert.equal(error.status, 401)
        assert.equal(error.message, 'Invalid credentials')
        return true
      }
    )
  } finally {
    userDelegate.findUnique = originalFindUnique
    ;(argon2 as any).verify = originalVerify
  }
})

test('AuthService.login returns token and public user fields on success', async () => {
  const service = new AuthService()
  const originalFindUnique = userDelegate.findUnique
  const originalVerify = (argon2 as any).verify
  const originalSign = (jwt as any).sign

  let signPayload: any
  let signSecret: any
  let signOptions: any

  userDelegate.findUnique = async () => ({
    id: 'user-2',
    name: 'Author Two',
    email: 'author2@example.com',
    password: 'hashed-password',
    role: 'author',
  })
  ;(argon2 as any).verify = async () => true
  ;(jwt as any).sign = (payload: any, secret: any, options: any) => {
    signPayload = payload
    signSecret = secret
    signOptions = options
    return 'signed-jwt-token'
  }

  try {
    const result = await service.login({
      email: 'author2@example.com',
      password: 'Strong@123',
    })

    assert.equal(result.token, 'signed-jwt-token')
    assert.deepEqual(result.user, {
      id: 'user-2',
      name: 'Author Two',
      email: 'author2@example.com',
      role: 'author',
    })
    assert.deepEqual(signPayload, { sub: 'user-2', role: 'author' })
    assert.equal(signSecret, env.JWT_SECRET)
    assert.equal(signOptions.expiresIn, env.JWT_EXPIRES_IN)
  } finally {
    userDelegate.findUnique = originalFindUnique
    ;(argon2 as any).verify = originalVerify
    ;(jwt as any).sign = originalSign
  }
})
