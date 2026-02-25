import { Router } from 'express'
import { ArticleController } from './article.controller'
import { authorize } from '../../middleware/rbac.middleware'
import { authenticate, optionalAuthenticate } from '../../middleware/auth.middleware'

const router = Router()
const articleController = new ArticleController()

// Public
router.get('/', (req, res) => articleController.getPublished(req, res))

router.get('/me', authenticate, authorize('author'), (req, res) => articleController.getMyArticles(req, res))
// Mixed - auth optional
router.get('/:id', optionalAuthenticate, (req, res) => articleController.getById(req, res))

// Author only
router.post('/', authenticate, authorize('author'), (req, res) => articleController.create(req, res))
router.put('/:id', authenticate, authorize('author'), (req, res) => articleController.update(req, res))
router.delete('/:id', authenticate, authorize('author'), (req, res) => articleController.softDelete(req, res))

export default router