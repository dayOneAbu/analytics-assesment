 
import { prisma } from '../../lib/prisma'
import { CreateArticleInput, UpdateArticleInput, ArticleQueryInput } from './article.schema'

export class ArticleRepository {
  async create(data: CreateArticleInput, authorId: string) {
    return prisma.article.create({
      data: { ...data, authorId }
    })
  }

  async findById(id: string) {
    return prisma.article.findFirst({
      where: { id, deletedAt: null }
    })
  }

  async findPublished(query: ArticleQueryInput) {
    const { category, author, q, page, pageSize } = query
    const skip = (page - 1) * pageSize

    const where: any = {
      status: 'Published',
      deletedAt: null,
      ...(category && { category }),
      ...(author && { author: { name: { contains: author, mode: 'insensitive' } } }),
      ...(q && { title: { contains: q, mode: 'insensitive' } }),
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: pageSize,
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.article.count({ where })
    ])

    return { articles, total }
  }

  async findByAuthor(authorId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: { authorId, deletedAt: null },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.article.count({ where: { authorId, deletedAt: null } })
    ])

    return { articles, total }
  }

  async update(id: string, data: UpdateArticleInput) {
    return prisma.article.update({
      where: { id },
      data
    })
  }

  async softDelete(id: string) {
    return prisma.article.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
  }

  async findByIdWithAnalytics(id: string) {
    return prisma.article.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: { select: { id: true, name: true } },
        dailyAnalytics: true
      }
    })
  }
}