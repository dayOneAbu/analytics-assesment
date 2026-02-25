import assert from 'node:assert/strict'
import test from 'node:test'
import type { Request, Response } from 'express'
import { AuthController } from '../../src/module/auth/auth.controller'
import { AuthService } from '../../src/module/auth/auth.service'

type MockResponse = Response & {
  statusCodeCaptured: number
  jsonBodyCaptured: unknown
}

function createMockResponse(): MockResponse {
  const response: any = {
    statusCodeCaptured: 200,
    jsonBodyCaptured: null,
    status(code: number) {
      this.statusCodeCaptured = code
      return this
    },
    json(body: unknown) {
      this.jsonBodyCaptured = body
      return this
    },
  }

  return response as MockResponse
}

test('AuthController.register returns 400 when payload is invalid', async () => {
  const controller = new AuthController()
  const request = {
    body: {
      name: '123Invalid',
      email: 'not-an-email',
      password: 'weak',
      role: 'reader',
    },
  } as Request
  const response = createMockResponse()

  await controller.register(request, response)

  assert.equal(response.statusCodeCaptured, 400)
  const body = response.jsonBodyCaptured as any
  assert.equal(body.Success, false)
  assert.equal(body.Message, 'Validation failed')
  assert.ok(Array.isArray(body.Errors))
  assert.ok(body.Errors.length > 0)
})

test('AuthController.register returns 201 on successful registration', async () => {
  const controller = new AuthController()
  const originalRegister = AuthService.prototype.register

  AuthService.prototype.register = async () => ({
    id: 'user-100',
    name: 'Registered User',
    email: 'registered@example.com',
    role: 'reader',
    createdAt: new Date('2026-02-25T00:00:00.000Z'),
  } as any)

  try {
    const request = {
      body: {
        name: 'Registered User',
        email: 'registered@example.com',
        password: 'Strong@123',
        role: 'reader',
      },
    } as Request
    const response = createMockResponse()

    await controller.register(request, response)

    assert.equal(response.statusCodeCaptured, 201)
    const body = response.jsonBodyCaptured as any
    assert.equal(body.Success, true)
    assert.equal(body.Message, 'User registered successfully')
    assert.equal(body.Object.email, 'registered@example.com')
  } finally {
    AuthService.prototype.register = originalRegister
  }
})

test('AuthController.login returns 401 when service rejects invalid credentials', async () => {
  const controller = new AuthController()
  const originalLogin = AuthService.prototype.login

  AuthService.prototype.login = async () => {
    throw { status: 401, message: 'Invalid credentials' }
  }

  try {
    const request = {
      body: {
        email: 'reader@example.com',
        password: 'Wrong@123',
      },
    } as Request
    const response = createMockResponse()

    await controller.login(request, response)

    assert.equal(response.statusCodeCaptured, 401)
    const body = response.jsonBodyCaptured as any
    assert.equal(body.Success, false)
    assert.equal(body.Message, 'Invalid credentials')
  } finally {
    AuthService.prototype.login = originalLogin
  }
})

test('AuthController.login returns 200 on success', async () => {
  const controller = new AuthController()
  const originalLogin = AuthService.prototype.login

  AuthService.prototype.login = async () => ({
    token: 'signed-jwt',
    user: {
      id: 'user-200',
      name: 'Reader',
      email: 'reader@example.com',
      role: 'reader',
    },
  })

  try {
    const request = {
      body: {
        email: 'reader@example.com',
        password: 'Strong@123',
      },
    } as Request
    const response = createMockResponse()

    await controller.login(request, response)

    assert.equal(response.statusCodeCaptured, 200)
    const body = response.jsonBodyCaptured as any
    assert.equal(body.Success, true)
    assert.equal(body.Message, 'Login successful')
    assert.equal(body.Object.token, 'signed-jwt')
  } finally {
    AuthService.prototype.login = originalLogin
  }
})
