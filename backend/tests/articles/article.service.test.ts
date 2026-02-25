import assert from 'node:assert/strict'
import test from 'node:test'
import { ArticleRepository } from '../../src/module/articles/article.repository'
import { ArticleService } from '../../src/module/articles/article.service'

test('ArticleService.create forwards payload and authorId to repository', async () => {
  const service = new ArticleService()
  const originalCreate = ArticleRepository.prototype.create
  let capturedData: any
  let capturedAuthorId: string | undefined

  ArticleRepository.prototype.create = async function (data: any, authorId: string) {
    capturedData = data
    capturedAuthorId = authorId
    return {
      id: 'article-1',
      ...data,
      authorId,
    } as any
  }

  try {
    const input = {
      title: 'Ownership in Prisma',
      content: 'B'.repeat(90),
      category: 'Engineering',
      status: 'Draft' as const,
    }
    const result = await service.create(input, 'author-1')

    assert.equal(capturedAuthorId, 'author-1')
    assert.deepEqual(capturedData, input)
    assert.equal(result.id, 'article-1')
  } finally {
    ArticleRepository.prototype.create = originalCreate
  }
})

test('ArticleService.getById throws 404 when article is missing', async () => {
  const service = new ArticleService()
  const originalFindByIdWithAnalytics = ArticleRepository.prototype.findByIdWithAnalytics

  ArticleRepository.prototype.findByIdWithAnalytics = async function () {
    return null
  }

  try {
    await assert.rejects(
      () => service.getById('missing-article'),
      (error: any) => {
        assert.equal(error.status, 404)
        assert.equal(error.message, 'News article no longer available')
        return true
      }
    )
  } finally {
    ArticleRepository.prototype.findByIdWithAnalytics = originalFindByIdWithAnalytics
  }
})

test('ArticleService.update throws 403 when author does not own the article', async () => {
  const service = new ArticleService()
  const originalFindById = ArticleRepository.prototype.findById

  ArticleRepository.prototype.findById = async function () {
    return { id: 'article-2', authorId: 'author-owner' } as any
  }

  try {
    await assert.rejects(
      () => service.update('article-2', 'author-other', { title: 'Updated title' }),
      (error: any) => {
        assert.equal(error.status, 403)
        assert.equal(error.message, 'Forbidden')
        return true
      }
    )
  } finally {
    ArticleRepository.prototype.findById = originalFindById
  }
})

test('ArticleService.update updates when owner matches', async () => {
  const service = new ArticleService()
  const originalFindById = ArticleRepository.prototype.findById
  const originalUpdate = ArticleRepository.prototype.update

  let updateArgs: any
  ArticleRepository.prototype.findById = async function () {
    return { id: 'article-3', authorId: 'author-3' } as any
  }
  ArticleRepository.prototype.update = async function (id: string, data: any) {
    updateArgs = { id, data }
    return { id, ...data } as any
  }

  try {
    const payload = { title: 'Owner update' }
    const result = await service.update('article-3', 'author-3', payload)

    assert.deepEqual(updateArgs, { id: 'article-3', data: payload })
    assert.equal(result.id, 'article-3')
    assert.equal(result.title, 'Owner update')
  } finally {
    ArticleRepository.prototype.findById = originalFindById
    ArticleRepository.prototype.update = originalUpdate
  }
})

test('ArticleService.softDelete throws 404 when article is missing', async () => {
  const service = new ArticleService()
  const originalFindById = ArticleRepository.prototype.findById

  ArticleRepository.prototype.findById = async function () {
    return null
  }

  try {
    await assert.rejects(
      () => service.softDelete('missing-article', 'author-1'),
      (error: any) => {
        assert.equal(error.status, 404)
        assert.equal(error.message, 'Article not found')
        return true
      }
    )
  } finally {
    ArticleRepository.prototype.findById = originalFindById
  }
})
