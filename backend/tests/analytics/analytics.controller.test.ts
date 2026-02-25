import assert from 'node:assert/strict'
import test from 'node:test'
import type { Request, Response } from 'express'
import { AnalyticsController } from '../../src/module/analytics/analytics.controller'
import { AnalyticsService } from '../../src/module/analytics/analytics.service'

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

test('AnalyticsController.getDashboard uses default pagination and user id', async () => {
  const controller = new AnalyticsController()
  const originalGetAuthorDashboard = AnalyticsService.prototype.getAuthorDashboard
  let capturedArgs: any

  AnalyticsService.prototype.getAuthorDashboard = async function (authorId: string, page: number, pageSize: number) {
    capturedArgs = { authorId, page, pageSize }
    return { articles: [], total: 0 } as any
  }

  try {
    const request = {
      query: {},
      user: { id: 'author-1', role: 'author' },
    } as unknown as Request
    const response = createMockResponse()

    await controller.getDashboard(request, response)

    assert.deepEqual(capturedArgs, { authorId: 'author-1', page: 1, pageSize: 10 })
    assert.equal(response.statusCodeCaptured, 200)
    const body = response.jsonBodyCaptured as any
    assert.equal(body.Success, true)
    assert.equal(body.Message, 'Dashboard fetched successfully')
  } finally {
    AnalyticsService.prototype.getAuthorDashboard = originalGetAuthorDashboard
  }
})

test('AnalyticsController.getDashboard returns 500 on service error', async () => {
  const controller = new AnalyticsController()
  const originalGetAuthorDashboard = AnalyticsService.prototype.getAuthorDashboard

  AnalyticsService.prototype.getAuthorDashboard = async function () {
    throw { status: 500, message: 'Failed to load dashboard' }
  }

  try {
    const request = {
      query: { page: '2', pageSize: '5' },
      user: { id: 'author-2', role: 'author' },
    } as unknown as Request
    const response = createMockResponse()

    await controller.getDashboard(request, response)

    assert.equal(response.statusCodeCaptured, 500)
    const body = response.jsonBodyCaptured as any
    assert.equal(body.Success, false)
    assert.equal(body.Message, 'Internal server error')
  } finally {
    AnalyticsService.prototype.getAuthorDashboard = originalGetAuthorDashboard
  }
})

test('AnalyticsController.getDashboard returns 400 for invalid pagination query', async () => {
  const controller = new AnalyticsController()
  const request = {
    query: { page: '0', pageSize: '0' },
    user: { id: 'author-3', role: 'author' },
  } as unknown as Request
  const response = createMockResponse()

  await controller.getDashboard(request, response)

  assert.equal(response.statusCodeCaptured, 400)
  const body = response.jsonBodyCaptured as any
  assert.equal(body.Success, false)
  assert.equal(body.Message, 'Invalid query parameters')
  assert.ok(Array.isArray(body.Errors))
})
