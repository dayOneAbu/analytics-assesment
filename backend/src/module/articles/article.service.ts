import { ArticleRepository } from './article.repository'
import { CreateArticleInput, UpdateArticleInput, ArticleQueryInput } from './article.schema'

const repo = new ArticleRepository()

export class ArticleService {
  async create(data: CreateArticleInput, authorId: string) {
    return repo.create(data, authorId)
  }

  async getPublished(query: ArticleQueryInput) {
    return repo.findPublished(query)
  }

  async getById(id: string) {
    const article = await repo.findByIdWithAnalytics(id)
    if (!article) {
      throw { status: 404, message: 'News article no longer available' }
    }
    return article
  }

  async getMyArticles(authorId: string, page: number, pageSize: number) {
    return repo.findByAuthor(authorId, page, pageSize)
  }

  async update(id: string, authorId: string, data: UpdateArticleInput) {
    const article = await repo.findById(id)

    if (!article) {
      throw { status: 404, message: 'Article not found' }
    }

    if (article.authorId !== authorId) {
      throw { status: 403, message: 'Forbidden' }
    }

    return repo.update(id, data)
  }

  async softDelete(id: string, authorId: string) {
    const article = await repo.findById(id)

    if (!article) {
      throw { status: 404, message: 'Article not found' }
    }

    if (article.authorId !== authorId) {
      throw { status: 403, message: 'Forbidden' }
    }

    return repo.softDelete(id)
  }
}