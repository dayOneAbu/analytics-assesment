import { prisma } from '../lib/prisma'

type ReadLogJobData = {
  articleId: string
  readerId?: string | null
}

type DailyAggregationJobData = {
  forDate?: string
}

const toUtcStartOfDay = (date: Date) => {
  const utcDate = new Date(date)
  utcDate.setUTCHours(0, 0, 0, 0)
  return utcDate
}

const resolveAggregationDate = (forDate?: string) => {
  if (forDate) {
    return toUtcStartOfDay(new Date(forDate))
  }

  // At midnight UTC, aggregate the day that just ended.
  const yesterdayUtc = new Date()
  yesterdayUtc.setUTCDate(yesterdayUtc.getUTCDate() - 1)
  return toUtcStartOfDay(yesterdayUtc)
}

export const processReadLogJob = async (data: ReadLogJobData) => {
  await prisma.readLog.create({
    data: {
      articleId: data.articleId,
      readerId: data.readerId ?? null,
      readAt: new Date(),
    },
  })
}

export const processDailyAggregationJob = async (data?: DailyAggregationJobData) => {
  const dayStart = resolveAggregationDate(data?.forDate)
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

  const groupedReads = await prisma.readLog.groupBy({
    by: ['articleId'],
    where: {
      readAt: { gte: dayStart, lt: dayEnd },
    },
    _count: { id: true },
  })

  for (const log of groupedReads) {
    await prisma.dailyAnalytics.upsert({
      where: {
        articleId_date: {
          articleId: log.articleId,
          date: dayStart,
        },
      },
      update: { viewCount: log._count.id },
      create: {
        articleId: log.articleId,
        viewCount: log._count.id,
        date: dayStart,
      },
    })
  }

  return { date: dayStart.toISOString().slice(0, 10), articles: groupedReads.length }
}
