import assert from 'node:assert/strict'
import test from 'node:test'
import { LoginSchema, RegisterSchema } from '../../src/module/auth/auth.schema'

test('RegisterSchema accepts valid payload', () => {
  const parsed = RegisterSchema.safeParse({
    name: 'John Reader',
    email: 'john@example.com',
    password: 'Strong@123',
    role: 'reader',
  })

  assert.equal(parsed.success, true)
})

test('RegisterSchema rejects weak password', () => {
  const parsed = RegisterSchema.safeParse({
    name: 'Jane Author',
    email: 'jane@example.com',
    password: 'weakpass',
    role: 'author',
  })

  assert.equal(parsed.success, false)
  if (!parsed.success) {
    assert.ok(parsed.error.issues.some((issue: { message: string }) => issue.message.includes('uppercase')))
  }
})

test('RegisterSchema rejects invalid role', () => {
  const parsed = RegisterSchema.safeParse({
    name: 'Jane Author',
    email: 'jane@example.com',
    password: 'Strong@123',
    role: 'admin',
  })

  assert.equal(parsed.success, false)
})

test('LoginSchema accepts valid payload', () => {
  const parsed = LoginSchema.safeParse({
    email: 'reader@example.com',
    password: 'some-password',
  })

  assert.equal(parsed.success, true)
})

test('LoginSchema rejects invalid email', () => {
  const parsed = LoginSchema.safeParse({
    email: 'not-an-email',
    password: 'some-password',
  })

  assert.equal(parsed.success, false)
})
