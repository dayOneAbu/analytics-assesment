import assert from 'node:assert/strict'
import test from 'node:test'
import { ArticleQuerySchema, CreateArticleSchema, UpdateArticleSchema } from '../../src/module/articles/article.schema'

test('CreateArticleSchema accepts a valid article payload', () => {
  const parsed = CreateArticleSchema.safeParse({
    title: 'Prisma 7 Ownership Patterns',
    content: 'A'.repeat(80),
    category: 'Tech',
    status: 'Published',
  })

  assert.equal(parsed.success, true)
})

test('CreateArticleSchema rejects content shorter than 50 chars', () => {
  const parsed = CreateArticleSchema.safeParse({
    title: 'Short content article',
    content: 'too short',
    category: 'Tech',
    status: 'Draft',
  })

  assert.equal(parsed.success, false)
})

test('UpdateArticleSchema allows partial updates', () => {
  const parsed = UpdateArticleSchema.safeParse({
    title: 'Updated title only',
  })

  assert.equal(parsed.success, true)
})

test('ArticleQuerySchema coerces pagination values', () => {
  const parsed = ArticleQuerySchema.safeParse({
    page: '2',
    pageSize: '15',
  })

  assert.equal(parsed.success, true)
  if (parsed.success) {
    assert.equal(parsed.data.page, 2)
    assert.equal(parsed.data.pageSize, 15)
  }
})
