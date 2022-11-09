import express from 'express'
const router = express.Router()

import { MongoService } from '../services/db.service'
import { DashboardController, IDashboardController } from '../controller/dashboard.controller'
import verifyJWT from '../middleware/verifyJWT'
const dashboardController = <IDashboardController>new DashboardController(new MongoService)

router.use(verifyJWT)

router.get('/', dashboardController.getAllDashboards)
router.get('/:userId', dashboardController.getDashboard)

export default router