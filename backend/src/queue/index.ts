import { env } from '../config/env'
import { processDailyAggregationJob, processReadLogJob } from './processors'

type QueueJobOptions = {
  jobId?: string
  removeOnComplete?: boolean
}

interface QueueInterface {
  add: (jobName: string, data: any, options?: QueueJobOptions) => Promise<unknown>
}

const recentFallbackJobIds = new Map<string, number>()

const fallbackQueue: QueueInterface = {
  add: async (jobName: string, data: any, options?: QueueJobOptions) => {
    if (options?.jobId) {
      const now = Date.now()
      const expiresAt = recentFallbackJobIds.get(options.jobId)

      if (typeof expiresAt === 'number' && expiresAt > now) {
        return
      }

      recentFallbackJobIds.set(options.jobId, now + 11_000)
      setTimeout(() => {
        recentFallbackJobIds.delete(options.jobId as string)
      }, 11_000)
    }

    if (jobName === 'log-read') {
      await processReadLogJob(data)
      return
    }

    if (jobName === 'daily-aggregation') {
      await processDailyAggregationJob(data)
      return
    }

    console.warn(`[Queue:Fallback] Unsupported job "${jobName}"`)
  }
}

let readLogQueue: QueueInterface = fallbackQueue
let analyticsQueue: QueueInterface = fallbackQueue

const initQueues = async () => {
  try {
    const { Queue } = await import('bullmq')

    const connection = {
      host: new URL(env.REDIS_URL).hostname,
      port: Number(new URL(env.REDIS_URL).port) || 6379,
    }

    readLogQueue = new Queue('read-log', { connection })
    analyticsQueue = new Queue('analytics', { connection })

    console.log('[Queue] BullMQ connected to Redis')
  } catch (err) {
    console.warn('[Queue] Redis unavailable — using fallback queue')
  }
}

initQueues()

export { readLogQueue, analyticsQueue }
