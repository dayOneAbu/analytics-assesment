import { z } from 'zod'

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
})

export const CreateArticleSchema = z.object({
  title: z.string().min(1).max(150),
  content: z.string().min(50),
  category: z.string().min(1),
  status: z.enum(['Draft', 'Published'] as const).default('Draft'),
})

export const UpdateArticleSchema = CreateArticleSchema.partial()

export const ArticleQuerySchema = PaginationSchema.extend({
  category: z.string().optional(),
  author: z.string().optional(),
  q: z.string().optional(),
})

export type CreateArticleInput = z.infer<typeof CreateArticleSchema>
export type UpdateArticleInput = z.infer<typeof UpdateArticleSchema>
export type ArticleQueryInput = z.infer<typeof ArticleQuerySchema>
