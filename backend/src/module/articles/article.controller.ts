import { Request, Response } from 'express'
import { ArticleService } from './article.service'
import { CreateArticleSchema, UpdateArticleSchema, ArticleQuerySchema, PaginationSchema } from './article.schema'
import { AuthenticatedRequest } from '../../types/index'
import { formatZodErrors, toSafeApiError } from '../../lib/errors'

const articleService = new ArticleService()

export class ArticleController {
  async create(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest
    const parsed = CreateArticleSchema.safeParse(req.body)

    if (!parsed.success) {
      return res.status(400).json({
        Success: false,
        Message: 'Validation failed',
        Object: null,
        Errors: formatZodErrors(parsed.error)
      })
    }

    try {
      const article = await articleService.create(parsed.data, authReq.user.id)
      return res.status(201).json({
        Success: true,
        Message: 'Article created successfully',
        Object: article,
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

  async getPublished(req: Request, res: Response) {
    const parsed = ArticleQuerySchema.safeParse(req.query)

    if (!parsed.success) {
      return res.status(400).json({
        Success: false,
        Message: 'Invalid query parameters',
        Object: null,
        Errors: formatZodErrors(parsed.error)
      })
    }

    try {
      const { articles, total } = await articleService.getPublished(parsed.data)
      return res.status(200).json({
        Success: true,
        Message: 'Articles fetched successfully',
        Object: articles,
        PageNumber: parsed.data.page,
        PageSize: parsed.data.pageSize,
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

  async getById(req: Request, res: Response) {
    const authReq = req as Partial<AuthenticatedRequest>

    try {
      const article = await articleService.getById(req.params.id as string)
      const actorKey = authReq.user?.id ? `user:${authReq.user.id}` : `guest:${req.ip || 'unknown'}`
      const dedupeBucket = Math.floor(Date.now() / 10_000)
      const readLogJobId = `read:${article.id}:${actorKey}:${dedupeBucket}`

      void import('../../queue/index')
        .then(({ readLogQueue }) => readLogQueue.add('log-read', {
          articleId: article.id,
          readerId: authReq.user?.id ?? null
        }, {
          jobId: readLogJobId,
          removeOnComplete: true,
        }))
        .catch(() => {})
      return res.status(200).json({
        Success: true,
        Message: 'Article fetched successfully',
        Object: article,
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

  async getMyArticles(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest
    const parsed = PaginationSchema.safeParse(req.query)

    if (!parsed.success) {
      return res.status(400).json({
        Success: false,
        Message: 'Invalid query parameters',
        Object: null,
        Errors: formatZodErrors(parsed.error)
      })
    }

    const { page, pageSize } = parsed.data

    try {
      const { articles, total } = await articleService.getMyArticles(authReq.user.id, page, pageSize)
      return res.status(200).json({
        Success: true,
        Message: 'Articles fetched successfully',
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

  async update(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest
    const parsed = UpdateArticleSchema.safeParse(req.body)

    if (!parsed.success) {
      return res.status(400).json({
        Success: false,
        Message: 'Validation failed',
        Object: null,
        Errors: formatZodErrors(parsed.error)
      })
    }

    try {
      const article = await articleService.update(req.params.id as string, authReq.user.id, parsed.data)
      return res.status(200).json({
        Success: true,
        Message: 'Article updated successfully',
        Object: article,
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

  async softDelete(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest

    try {
      await articleService.softDelete(req.params.id as string, authReq.user.id)
      return res.status(200).json({
        Success: true,
        Message: 'Article deleted successfully',
        Object: null,
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
