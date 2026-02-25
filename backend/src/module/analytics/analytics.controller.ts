import { Request, Response } from 'express'
import { formatZodErrors, toSafeApiError } from '../../lib/errors'
import { AuthenticatedRequest } from '../../types/index'
import { AnalyticsService } from './analytics.service'
import { DashboardQuerySchema } from './analytics.schema'

const analyticsService = new AnalyticsService()

export class AnalyticsController {
  async getDashboard(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest
    const parsed = DashboardQuerySchema.safeParse(req.query)

    if (!parsed.success) {
      return res.status(400).json({
        Success: false,
        Message: 'Invalid query parameters',
        Object: null,
        Errors: formatZodErrors(parsed.error),
      })
    }

    const { page, pageSize } = parsed.data

    try {
      const { articles, total } = await analyticsService.getAuthorDashboard(
        authReq.user.id,
        page,
        pageSize
      )

      return res.status(200).json({
        Success: true,
        Message: 'Dashboard fetched successfully',
        Object: articles,
        PageNumber: page,
        PageSize: pageSize,
        TotalSize: total,
        Errors: null
      })
    } catch (err: any) {
      const safeError = toSafeApiError(err)

      return res.status(safeError.status).json({
        Success: false,
        Message: safeError.message,
        Object: null,
        Errors: safeError.errors
      })
    }
  }
}
