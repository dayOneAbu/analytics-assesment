import { env } from '../config/env'
import { processDailyAggregationJob, processReadLogJob } from './processors'

export const startWorkers = async () => {
  try {
    const { Worker } = await import('bullmq')

    const connection = {
      host: new URL(env.REDIS_URL).hostname,
      port: Number(new URL(env.REDIS_URL).port) || 6379,
    }

    // Worker 1 — read log insertion
    new Worker('read-log', async (job) => {
      await processReadLogJob(job.data)
      console.log(`[Worker] ReadLog created for article ${job.data.articleId}`)
    }, { connection })

    // Worker 2 — daily aggregation
    new Worker('analytics', async (job) => {
      const result = await processDailyAggregationJob(job.data)
      console.log(`[Analytics] Aggregation complete for ${result.date} (${result.articles} articles)`)
    }, { connection })

    console.log('[Workers] Started successfully')
  } catch (err) {
    console.warn('[Workers] Redis unavailable — workers not started')
  }
}
