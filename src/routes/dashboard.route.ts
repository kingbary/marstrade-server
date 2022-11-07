import express from 'express'
const router = express.Router()

import { MongoService } from '../services/db.service'
import { DashboardController, IDashboardController } from '../controller/dashboard.controller'
const dashboardController = <IDashboardController>new DashboardController(new MongoService)

router.get('/', dashboardController.getAllDashboards)
router.get('/:userId', dashboardController.getDashboard)

export default router