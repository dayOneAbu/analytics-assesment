import { prisma } from '../../lib/prisma'

export class AnalyticsRepository {
  async getAuthorDashboard(authorId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: { authorId, deletedAt: null },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          status: true,
          dailyAnalytics: {
            select: { viewCount: true }
          }
        }
      }),
      prisma.article.count({
        where: { authorId, deletedAt: null }
      })
    ])

    const formatted = articles.map((article) => {
      const totalViews = article.dailyAnalytics.reduce((sum, daily) => sum + daily.viewCount, 0)

      return {
        id: article.id,
        title: article.title,
        createdAt: article.createdAt,
        status: article.status,
        TotalViews: totalViews,
      }
    })

    return { articles: formatted, total }
  }
}
