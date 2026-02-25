import { z } from 'zod'

export const CreateArticleSchema = z.object({
  title: z.string().min(1).max(150),
  content: z.string().min(50),
  category: z.string().min(1),
  status: z.enum(['Draft', 'Published'] as const).default('Draft'),
})

export const UpdateArticleSchema = CreateArticleSchema.partial()

export const ArticleQuerySchema = z.object({
  category: z.string().optional(),
  author: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(10),
})

export type CreateArticleInput = z.infer<typeof CreateArticleSchema>
export type UpdateArticleInput = z.infer<typeof UpdateArticleSchema>
export type ArticleQueryInput = z.infer<typeof ArticleQuerySchema>