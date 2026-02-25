import { env } from '../config/env'

export const startScheduler = async () => {
  try {
    const { Queue } = await import('bullmq')

    const connection = {
      host: new URL(env.REDIS_URL).hostname,
      port: Number(new URL(env.REDIS_URL).port) || 6379,
    }

    const analyticsQueue = new Queue('analytics', { connection })

    await analyticsQueue.add(
      'daily-aggregation',
      {},
      {
        jobId: 'daily-aggregation-utc',
        repeat: {
          pattern: '0 0 * * *',
          tz: 'Etc/UTC',
        },
        removeOnComplete: true,
      }
    )

    console.log('[Scheduler] Daily analytics job scheduled')
  } catch (err) {
    console.warn('[Scheduler] Redis unavailable — scheduler not started')
  }
}
