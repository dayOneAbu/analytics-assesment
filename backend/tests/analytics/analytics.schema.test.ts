import assert from 'node:assert/strict'
import test from 'node:test'
import { DashboardQuerySchema } from '../../src/module/analytics/analytics.schema'

test('DashboardQuerySchema applies defaults', () => {
  const parsed = DashboardQuerySchema.safeParse({})

  assert.equal(parsed.success, true)
  if (parsed.success) {
    assert.equal(parsed.data.page, 1)
    assert.equal(parsed.data.pageSize, 10)
  }
})

test('DashboardQuerySchema coerces valid query values', () => {
  const parsed = DashboardQuerySchema.safeParse({ page: '2', pageSize: '25' })

  assert.equal(parsed.success, true)
  if (parsed.success) {
    assert.equal(parsed.data.page, 2)
    assert.equal(parsed.data.pageSize, 25)
  }
})

test('DashboardQuerySchema rejects invalid page values', () => {
  const parsed = DashboardQuerySchema.safeParse({ page: '0', pageSize: '200' })

  assert.equal(parsed.success, false)
})
