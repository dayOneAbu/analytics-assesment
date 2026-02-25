import { Router } from 'express'
import { AnalyticsController } from './analytics.controller'
import { authenticate } from '../../middleware/auth.middleware'
import { authorize } from '../../middleware/rbac.middleware'

const router = Router()
const analyticsController = new AnalyticsController()

router.get('/dashboard', authenticate, authorize('author'), (req, res) => analyticsController.getDashboard(req, res))

export default router