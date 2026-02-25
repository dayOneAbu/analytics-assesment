import assert from 'node:assert/strict'
import test from 'node:test'
import { AnalyticsRepository } from '../../src/module/analytics/analytics.repository'
import { AnalyticsService } from '../../src/module/analytics/analytics.service'

test('AnalyticsService.getAuthorDashboard forwards args to repository', async () => {
  const service = new AnalyticsService()
  const originalGetAuthorDashboard = AnalyticsRepository.prototype.getAuthorDashboard
  let capturedArgs: any

  AnalyticsRepository.prototype.getAuthorDashboard = async function (authorId: string, page: number, pageSize: number) {
    capturedArgs = { authorId, page, pageSize }
    return { articles: [{ id: 'a-1' }], total: 1 } as any
  }

  try {
    const result = await service.getAuthorDashboard('author-10', 3, 20)

    assert.deepEqual(capturedArgs, { authorId: 'author-10', page: 3, pageSize: 20 })
    assert.equal(result.total, 1)
    assert.equal(result.articles[0].id, 'a-1')
  } finally {
    AnalyticsRepository.prototype.getAuthorDashboard = originalGetAuthorDashboard
  }
})
