import { z } from 'zod'

export const DashboardQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
})

export type DashboardQueryInput = z.infer<typeof DashboardQuerySchema>
