import assert from 'node:assert/strict'
import test from 'node:test'
import { prisma } from '../../src/lib/prisma'
import { AnalyticsRepository } from '../../src/module/analytics/analytics.repository'

const articleDelegate = prisma.article as any

test('AnalyticsRepository.getAuthorDashboard queries article list and formats TotalViews', async () => {
  const repo = new AnalyticsRepository()
  const originalFindMany = articleDelegate.findMany
  const originalCount = articleDelegate.count
  let findManyArgs: any
  let countArgs: any

  articleDelegate.findMany = async (args: any) => {
    findManyArgs = args
    return [
      {
        id: 'article-1',
        title: 'Article One',
        createdAt: new Date('2026-02-25T00:00:00.000Z'),
        status: 'Published',
        dailyAnalytics: [{ viewCount: 4 }, { viewCount: 7 }],
      },
      {
        id: 'article-2',
        title: 'Article Two',
        createdAt: new Date('2026-02-26T00:00:00.000Z'),
        status: 'Draft',
        dailyAnalytics: [],
      },
    ]
  }

  articleDelegate.count = async (args: any) => {
    countArgs = args
    return 2
  }

  try {
    const result = await repo.getAuthorDashboard('author-20', 2, 10)

    assert.equal(findManyArgs.where.authorId, 'author-20')
    assert.equal(findManyArgs.where.deletedAt, null)
    assert.equal(findManyArgs.skip, 10)
    assert.equal(findManyArgs.take, 10)
    assert.deepEqual(countArgs, { where: { authorId: 'author-20', deletedAt: null } })

    assert.equal(result.total, 2)
    assert.equal(result.articles[0].TotalViews, 11)
    assert.equal(result.articles[1].TotalViews, 0)
  } finally {
    articleDelegate.findMany = originalFindMany
    articleDelegate.count = originalCount
  }
})
