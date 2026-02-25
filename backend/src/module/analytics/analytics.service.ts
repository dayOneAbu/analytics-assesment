import { AnalyticsRepository } from './analytics.repository'

const repo = new AnalyticsRepository()

export class AnalyticsService {
  async getAuthorDashboard(authorId: string, page: number, pageSize: number) {
    return repo.getAuthorDashboard(authorId, page, pageSize)
  }
}