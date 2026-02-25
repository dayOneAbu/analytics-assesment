export const readLogQueue = {
  add: async (jobName: string, data: { articleId: string; readerId: string | null }) => {
    // TODO: replace with BullMQ
    console.log(`[Queue] Job "${jobName}" queued:`, data)
  }
}