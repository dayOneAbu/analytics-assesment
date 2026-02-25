import assert from 'node:assert/strict'
import test from 'node:test'
import type { Request, Response } from 'express'
import { ArticleController } from '../../src/module/articles/article.controller'
import { ArticleService } from '../../src/module/articles/article.service'

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

test('ArticleController.create returns 400 for invalid payload', async () => {
  const controller = new ArticleController()
  const request = {
    body: {
      title: '',
      content: 'short',
      category: '',
      status: 'Draft',
    },
    user: { id: 'author-1', role: 'author' },
  } as unknown as Request
  const response = createMockResponse()

  await controller.create(request, response)

  assert.equal(response.statusCodeCaptured, 400)
  const body = response.jsonBodyCaptured as any
  assert.equal(body.Success, false)
  assert.equal(body.Message, 'Validation failed')
  assert.ok(Array.isArray(body.Errors))
})

test('ArticleController.create forwards owner id from req.user.id', async () => {
  const controller = new ArticleController()
  const originalCreate = ArticleService.prototype.create
  let capturedAuthorId: string | undefined

  ArticleService.prototype.create = async function (_data: any, authorId: string) {
    capturedAuthorId = authorId
    return { id: 'article-100', title: 'Created article' } as any
  }

  try {
    const request = {
      body: {
        title: 'Created article',
        content: 'C'.repeat(80),
        category: 'News',
        status: 'Draft',
      },
      user: { id: 'author-100', role: 'author' },
    } as unknown as Request
    const response = createMockResponse()

    await controller.create(request, response)

    assert.equal(capturedAuthorId, 'author-100')
    assert.equal(response.statusCodeCaptured, 201)
    const body = response.jsonBodyCaptured as any
    assert.equal(body.Success, true)
    assert.equal(body.Message, 'Article created successfully')
  } finally {
    ArticleService.prototype.create = originalCreate
  }
})

test('ArticleController.getPublished returns 400 for invalid query params', async () => {
  const controller = new ArticleController()
  const request = {
    query: {
      page: 'abc',
      pageSize: 'not-number',
    },
  } as unknown as Request
  const response = createMockResponse()

  await controller.getPublished(request, response)

  assert.equal(response.statusCodeCaptured, 400)
  const body = response.jsonBodyCaptured as any
  assert.equal(body.Success, false)
  assert.equal(body.Message, 'Invalid query parameters')
})

test('ArticleController.getMyArticles uses default pagination values', async () => {
  const controller = new ArticleController()
  const originalGetMyArticles = ArticleService.prototype.getMyArticles
  let capturedArgs: any

  ArticleService.prototype.getMyArticles = async function (authorId: string, page: number, pageSize: number) {
    capturedArgs = { authorId, page, pageSize }
    return { articles: [], total: 0 }
  }

  try {
    const request = {
      query: {},
      user: { id: 'author-77', role: 'author' },
    } as unknown as Request
    const response = createMockResponse()

    await controller.getMyArticles(request, response)

    assert.deepEqual(capturedArgs, { authorId: 'author-77', page: 1, pageSize: 10 })
    assert.equal(response.statusCodeCaptured, 200)
  } finally {
    ArticleService.prototype.getMyArticles = originalGetMyArticles
  }
})

test('ArticleController.update returns 400 when body is invalid', async () => {
  const controller = new ArticleController()
  const request = {
    params: { id: 'article-1' },
    body: { content: 'tiny' },
    user: { id: 'author-1', role: 'author' },
  } as unknown as Request
  const response = createMockResponse()

  await controller.update(request, response)

  assert.equal(response.statusCodeCaptured, 400)
  const body = response.jsonBodyCaptured as any
  assert.equal(body.Success, false)
  assert.equal(body.Message, 'Validation failed')
})
